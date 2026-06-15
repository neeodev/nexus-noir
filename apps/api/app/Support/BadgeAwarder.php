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
    public static function onRegister(User $user): void
    {
        self::awardByCondition($user, 'register');
        self::awardOgMember($user);
    }

    public static function onView(User $user, ?\App\Models\Story $story = null): void
    {
        $count = StoryView::query()
            ->where('user_id', $user->id)
            ->distinct('story_id')
            ->count('story_id');

        self::awardByConditionThreshold($user, 'readings_count', $count);

        // Lecteur de nuit : entre 00h00 et 04h00 UTC
        if (Carbon::now('UTC')->hour < 4) {
            self::awardByCondition($user, 'reading_at_night');
        }

        // Early bird : X premières minutes après publication
        if ($story?->published_at) {
            $elapsed = (int) Carbon::now()->diffInMinutes($story->published_at, absolute: true);
            self::awardEarlyBird($user, $elapsed);
        }

        self::checkAccountAge($user);
    }

    public static function onReaction(User $user): void
    {
        $count = StoryReaction::query()
            ->where('user_id', $user->id)
            ->count();

        self::awardByConditionThreshold($user, 'reactions_given', $count);
    }

    public static function onComment(User $user): void
    {
        $count = Comment::query()
            ->where('user_id', $user->id)
            ->count();

        self::awardByConditionThreshold($user, 'comments_count', $count);
    }

    /** Retourne les badges débloqués, ou [] si code invalide. */
    public static function onSecretCode(User $user, string $code): array
    {
        $badges = Badge::query()
            ->active()
            ->where('condition_type', 'secret_code')
            ->get()
            ->filter(fn ($badge) => ($badge->condition_meta['code'] ?? null) === $code);

        $awarded = [];
        foreach ($badges as $badge) {
            if (self::award($user, $badge)) {
                $awarded[] = $badge;
            }
        }
        return $awarded;
    }

    private static function checkAccountAge(User $user): void
    {
        $days = (int) Carbon::now()->diffInDays($user->created_at, absolute: true);
        self::awardByConditionThreshold($user, 'account_age', $days);
    }

    private static function awardOgMember(User $user): void
    {
        Badge::query()
            ->active()
            ->where('condition_type', 'og_member')
            ->get()
            ->each(function (Badge $badge) use ($user) {
                $meta = $badge->condition_meta ?? [];
                if (empty($meta['launch_date'])) {
                    return;
                }

                $launchDate  = Carbon::parse($meta['launch_date'])->startOfDay();
                $windowDays  = (int) ($meta['window_days'] ?? 7);
                $registeredAt = Carbon::parse($user->created_at);

                if ($registeredAt->between($launchDate, $launchDate->copy()->addDays($windowDays))) {
                    self::award($user, $badge);
                }
            });
    }

    private static function awardEarlyBird(User $user, int $elapsedMinutes): void
    {
        $badges = Badge::query()
            ->active()
            ->where('condition_type', 'early_bird')
            ->where('condition_value', '>=', $elapsedMinutes)
            ->get();

        foreach ($badges as $badge) {
            self::award($user, $badge);
        }
    }

    private static function awardByCondition(User $user, string $conditionType): void
    {
        Badge::query()
            ->active()
            ->where('condition_type', $conditionType)
            ->get()
            ->each(fn ($badge) => self::award($user, $badge));
    }

    private static function awardByConditionThreshold(User $user, string $conditionType, int $currentCount): void
    {
        Badge::query()
            ->active()
            ->where('condition_type', $conditionType)
            ->where('condition_value', '<=', $currentCount)
            ->get()
            ->each(fn ($badge) => self::award($user, $badge));
    }

    /** Retourne true si le badge a été décerné (false si déjà possédé). */
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
