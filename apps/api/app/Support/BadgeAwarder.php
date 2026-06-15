<?php
namespace App\Support;

use App\Models\Badge;
use App\Models\Comment;
use App\Models\StoryReaction;
use App\Models\StoryView;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Support\Carbon;

class BadgeAwarder
{
    /** @return Badge[] */
    public static function onRegister(User $user): array
    {
        return array_merge(
            self::awardByCondition($user, 'register'),
            self::awardOgMember($user),
        );
    }

    /** @return Badge[] */
    public static function onView(User $user, ?\App\Models\Story $story = null): array
    {
        $count = StoryView::query()
            ->where('user_id', $user->id)
            ->distinct('story_id')
            ->count('story_id');

        $awarded = array_merge(
            self::awardByConditionThreshold($user, 'readings_count', $count),
            self::checkAccountAge($user),
        );

        if (Carbon::now('UTC')->hour < 4) {
            $awarded = array_merge($awarded, self::awardByCondition($user, 'reading_at_night'));
        }

        if ($story?->published_at) {
            $elapsed = (int) Carbon::now()->diffInMinutes($story->published_at, absolute: true);
            $awarded = array_merge($awarded, self::awardEarlyBird($user, $elapsed));
        }

        return $awarded;
    }

    /** @return Badge[] */
    public static function onReaction(User $user): array
    {
        $count = StoryReaction::query()
            ->where('user_id', $user->id)
            ->count();

        return self::awardByConditionThreshold($user, 'reactions_given', $count);
    }

    /** @return Badge[] */
    public static function onComment(User $user): array
    {
        $count = Comment::query()
            ->where('user_id', $user->id)
            ->count();

        return self::awardByConditionThreshold($user, 'comments_count', $count);
    }

    /** @return Badge[] */
    public static function onSecretCode(User $user, string $code): array
    {
        return Badge::query()
            ->active()
            ->where('condition_type', 'secret_code')
            ->get()
            ->filter(fn ($badge) => ($badge->condition_meta['code'] ?? null) === $code)
            ->filter(fn ($badge) => self::award($user, $badge))
            ->values()
            ->all();
    }

    /** @return Badge[] */
    private static function checkAccountAge(User $user): array
    {
        $days = (int) Carbon::now()->diffInDays($user->created_at, absolute: true);
        return self::awardByConditionThreshold($user, 'account_age', $days);
    }

    /** @return Badge[] */
    private static function awardOgMember(User $user): array
    {
        return Badge::query()
            ->active()
            ->where('condition_type', 'og_member')
            ->get()
            ->filter(function (Badge $badge) use ($user) {
                $meta = $badge->condition_meta ?? [];
                if (empty($meta['launch_date'])) return false;

                $launchDate  = Carbon::parse($meta['launch_date'])->startOfDay();
                $windowDays  = (int) ($meta['window_days'] ?? 7);
                $registeredAt = Carbon::parse($user->created_at);

                return $registeredAt->between($launchDate, $launchDate->copy()->addDays($windowDays))
                    && self::award($user, $badge);
            })
            ->values()
            ->all();
    }

    /** @return Badge[] */
    private static function awardEarlyBird(User $user, int $elapsedMinutes): array
    {
        return Badge::query()
            ->active()
            ->where('condition_type', 'early_bird')
            ->where('condition_value', '>=', $elapsedMinutes)
            ->get()
            ->filter(fn ($badge) => self::award($user, $badge))
            ->values()
            ->all();
    }

    /** @return Badge[] */
    private static function awardByCondition(User $user, string $conditionType): array
    {
        return Badge::query()
            ->active()
            ->where('condition_type', $conditionType)
            ->get()
            ->filter(fn ($badge) => self::award($user, $badge))
            ->values()
            ->all();
    }

    /** @return Badge[] */
    private static function awardByConditionThreshold(User $user, string $conditionType, int $currentCount): array
    {
        return Badge::query()
            ->active()
            ->where('condition_type', $conditionType)
            ->where('condition_value', '<=', $currentCount)
            ->get()
            ->filter(fn ($badge) => self::award($user, $badge))
            ->values()
            ->all();
    }

    private static function award(User $user, Badge $badge): bool
    {
        if ($user->badges()->where('badge_id', $badge->id)->exists()) {
            return false;
        }

        UserBadge::create([
            'user_id'    => $user->id,
            'badge_id'   => $badge->id,
            'awarded_at' => now(),
        ]);

        return true;
    }
}
