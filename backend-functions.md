# TuneBridge – Backend Functions Reference

> **Scope**  All user‑defined functions in the project schemas (`users`, `social`, `music`, …). System functions and extensions are intentionally omitted.

---

## 1  Profile Creation & Validation

| Function                                                     | Purpose                                                                                                                               |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `users.create_profile_when_authenticated()`                  | Auto‑creates a profile, privacy settings and UI preferences whenever an `auth.users` row transitions into the **authenticated** role. |
| `users.prevent_duplicate_usernames()`                        | Rejects `INSERT / UPDATE` if another profile already owns the same `username`.                                                        |
| `users.roles_in_group_no_duplicates(roles TEXT[]) → BOOLEAN` | Helper used in constraints – returns **false** if the provided text array contains repeated roles.                                    |

---

## 2  Search Vector Maintenance (Profiles)

| Function                                          | Purpose                                                                                                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users.update_profile_content_search()`           | Rebuilds the base search vector (`content_search`) from username, name, e‑mail, location and bio fields (Spanish + English dictionaries).                                   |
| `users.update_content_search_roles_trigger()`     | Regenerates `content_search_roles` every time the **roles** of a profile change. Runs under *SECURITY DEFINER* so the trigger on `music.roles` can update `users.profiles`. |
| `social.refresh_profile_content_search_details()` | Updates `content_search_details` when hashtags linked to a profile are inserted, updated or deleted.                                                                        |
| `users.update_content_search_all()`               | Concatenates `content_search`, `content_search_roles` and `content_search_details` into the final `content_search_all` column.                                              |

---

## 3  Profile Matching & Activity Tracking

| Function                                                                | Purpose                                                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `users.profile_match_score(profile_a UUID, profile_b UUID)`             | Calculates a similarity score between two profiles based on the token intersection of their `content_search_all` vectors. |
| `users.profile_match_all(profile_a UUID, limit_results INT DEFAULT 10)` | Returns the top‑N matching profiles for a given profile, ordered by the score above.                                      |
| `users.touch_profile_last_seen()`                                       | Updates the `last_seen` column of the currently authenticated user (`auth.uid()`). Runs as *SECURITY DEFINER*.            |

---

## 4  Profile Groups

| Function                               | Purpose                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `users.add_creator_to_group_members()` | Inserts the group creator as an **admin** in `profile_group_members` right after a new group is created. |
| `users.reassign_admin_on_leave()`      | Promotes the earliest member to admin when the last admin leaves a group.                                |

---

## 5  UI & Privacy Preferences

| Function                 | Purpose                                                                           |
| ------------------------ | --------------------------------------------------------------------------------- |
| `users.touch_ui_prefs()` | Sets `updated_at = NOW()` on the row being updated inside `users.ui_preferences`. |
| `users.touch_privacy()`  | Same behaviour for `users.privacy_settings`.                                      |

---

## 6  Notifications Framework

| Function                                                             | Purpose                                                                                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `social.can_receive_notif(tgt_profile UUID, channel TEXT) → BOOLEAN` | Returns whether the target profile has a given notification channel enabled (defaults to **true** when no row exists). |
| `social.notify_comment()`                                            | Inserts a **comment** notification for the post owner.                                                                 |
| `social.notify_like()`                                               | Inserts a **like** notification for the post owner.                                                                    |
| `social.notify_follow_request()`                                     | Inserts a **follow\_request** notification for the target user.                                                        |
| `users.notify_profile_group_join()`                                  | Notifies a user when they join a group.                                                                                |
| `users.notify_profile_group_leave()`                                 | Handles notifications when a user leaves or is removed from a group.                                                   |

---

## 7  Conversations & Messaging

| Function                                                              | Purpose                                                                                |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `social.prevent_duplicate_participants()`                             | Rejects duplicate participants in a conversation.                                      |
| `social.set_creator_as_admin()`                                       | Promotes the conversation creator to admin when the conversation becomes a group chat. |
| `social.delete_messages_on_conversation_delete()`                     | Cascades a hard delete of all messages once a conversation is removed.                 |
| `social.soft_delete_message()`                                        | Converts a DELETE on `messages` into a soft delete (`deleted_at`).                     |
| `social.update_message_timestamp()`                                   | Updates `updated_at` whenever a message is edited.                                     |
| `social.find_one_on_one_conversation(profile_a UUID, profile_b UUID)` | Retrieves an existing private conversation between two profiles, if any.               |

---

## 8  Posts, Comments & Likes

| Function                               | Purpose                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `social.refresh_post_content_search()` | Recomputes the post search vector whenever the post or its hashtags change.            |
| `social.update_post_timestamp()`       | Touches `updated_at` on post edits.                                                    |
| `social.update_comment_timestamp()`    | Touches `updated_at` on comment edits.                                                 |
| `social.prevent_duplicate_likes()`     | Throws an error if the same user tries to like the same entity twice.                  |
| `social.update_like_status()`          | Toggle behaviour: inserts a like when none exists, otherwise deletes the existing one. |

---

## 9  Connections & Follows

| Function                               | Purpose                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `social.update_connection_timestamp()` | Touches `updated_at` when a connection row changes status.                                 |
| `social.check_and_delete_duplicate()`  | Ensures at most one connection per follower by deleting existing duplicates before insert. |

---

## 10  Musician Ads

| Function                           | Purpose                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `social.musician_ads_tsv_update()` | Builds or refreshes the full‑text search vector (`content_search`) on `social.musician_ads` insert / update. |

---

## 11  Events (groups.event\_rsvps)

| Function                         | Purpose                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `groups.update_rsvp_timestamp()` | Updates `updated_at` every time an RSVP row is modified. |

---

## 12  Admin Panel

| Function                                              | Purpose                                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `admin.is_admin(profile UUID) → BOOLEAN`              | Returns `true` if the profile is listed as an **admin** or **moderator** in `admin.admin_roles`.          |
| `admin.log_admin_action()`                            | Trigger function that logs moderation/admin actions into `admin.admin_logs`.                              |
| `admin.handle_user_ban()`                             | Trigger function that updates the banned user’s profile state to `'banned'`.                              |
| `admin.sync_feedback_status()`                        | When feedback status changes to `'handled'`, logs the action using `admin.log_admin_action()`.            |
| `admin.notify_admin_report_received()`                | Notifies all admins with the `'review_reports'` permission about a new user report via `social.notifications`. |

---

> **Note**  All trigger functions are declared `SET search_path`‑safe and run under the minimal privileges required. Security‑definer is only used when cross‑schema permissions are necessary.


create or replace function admin.set_default_permissions()
returns trigger as $$
begin
  -- Solo auto-poblar si NO se especificaron permisos
  if NEW.permissions is null or array_length(NEW.permissions, 1) is null then
    if NEW.role = 'admin' then
      NEW.permissions := array[
        'manage_users',
        'ban_users',
        'review_reports',
        'view_feedback',
        'access_logs',
        'edit_roles'
      ];
    elsif NEW.role = 'moderator' then
      NEW.permissions := array[
        'ban_users',
        'review_reports'
      ];
    elsif NEW.role = 'auditor' then
      NEW.permissions := array[
        'view_feedback',
        'access_logs'
      ];
    else
      NEW.permissions := array[]::text[]; -- vacío si es un rol desconocido
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql;


select cron.schedule(
  'mark_expired_bans',
  '*/1 * * * *',  -- cada minuto
  $$
    update admin.banned_users
    set deleted_at = now()
    where banned_until <= now()
      and deleted_at is null;
  $$
);