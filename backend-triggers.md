# 🎯 TuneBridge Database Triggers Overview

## public (Global / Multiple Tables)

- **add_creator_to_group_members_trg**
  - Table: `users.profile_groups`
  - Calls function: `add_creator_to_group_members`
  - Inserts the group creator as admin in the profile_group_members table on group creation.

## social.notifications

- **notify_comment_trg**
  - Table: `social.post_comments` (o `social.posts`)
  - Calls function: `notify_comment`
  - Creates a notification when a comment is added to a post.

- **notify_like_trg**
  - Table: `social.likes`
  - Calls function: `notify_like`
  - Notifies the post/comment owner when someone likes.

- **notify_follow_request_trg**
  - Table: `social.user_connections`
  - Calls function: `notify_follow_request`
  - When a follow request is created, notifies the target user.

- **notify_profile_group_join_trg**
  - Table: `users.profile_group_members`
  - Calls function: `notify_profile_group_join`
  - Notifies user upon joining a group.

- **notify_profile_group_leave_trg**
  - Table: `users.profile_group_members`
  - Calls function: `notify_profile_group_leave`
  - Notifies either group members or removed user depending on situation.

## social.likes & social.user_connections

- **prevent_duplicate_likes_trg**
  - Table: `social.likes`
  - Calls function: `prevent_duplicate_likes`
  - Prevents same user liking same entity more than once.

- **update_like_toggle_trg**
  - Table: `social.likes`
  - Calls function: `update_like_status`
  - Toggles like/unlike on insert.

## social.conversation_participants / social.conversations

- **prevent_duplicate_participants_trg**
  - Table: `social.conversation_participants`
  - Calls function: `prevent_duplicate_participants`
  - Ensures participants aren't added twice.

- **set_creator_as_admin_trg**
  - Table: `social.conversations`
  - Calls function: `set_creator_as_admin`
  - When marking a conversation as group, auto-assigns creator as admin.

- **delete_messages_on_conversation_delete_trg**
  - Table: `social.conversations`
  - Calls function: `delete_messages_on_conversation_delete`
  - Cleans up all messages when a conversation is deleted.

## social.posts / social.post_hashtags

- **refresh_post_content_search_trg**
  - Tables: `social.posts`, `social.post_hashtags`
  - Calls function: `social.refresh_post_content_search`
  - Regenerates post search index on content or hashtag changes.

## users.profiles, users.profile_hashtags, music.roles

- **update_profile_content_search_trg**
  - Table: `users.profiles`
  - Calls function: `users.update_profile_content_search`
  - Updates base tsvector fields upon profile insert/update.

- **update_content_search_roles_trg**
  - Table: `music.roles`
  - Calls function: `users.update_content_search_roles_trigger`
  - Syncs roles search vector when roles change.

- **refresh_profile_content_search_details_trg**
  - Table: `social.profile_hashtags`
  - Calls function: `social.refresh_profile_content_search_details`
  - Updates hashtag-based search vector on change.

- **update_content_search_all_trg**
  - Table: `users.profiles`
  - Calls function: `users.update_content_search_all`
  - Combines all tsvector columns into a single `content_search_all`.

## users.profile_group_members

- **trg_reassign_admin_on_leave**
  - Table: `users.profile_group_members`
  - Calls function: `users.reassign_admin_on_leave`
  - Automatically promotes a new admin when the last admin leaves.

## social.messages

- **soft_delete_message_trg**
  - Table: `social.messages`
  - Calls function: `social.soft_delete_message`
  - Marks message as deleted upon delete action.

- **update_message_timestamp_trg**
  - Table: `social.messages`
  - Calls function: `social.update_message_timestamp`
  - Refreshes `updated_at` timestamp on message update.

## social.posts (timestamp tracking)

- **update_post_timestamp_trg**
  - Table: `social.posts`
  - Calls function: `social.update_post_timestamp`
  - Updates `updated_at` on post edits.

## social.post_comments (timestamp tracking)

- **update_comment_timestamp_trg**
  - Table: `social.post_comments`
  - Calls function: `social.update_comment_timestamp`
  - Updates `updated_at` when a comment is edited.

## social.user_connections (timestamp tracking)

- **update_connection_timestamp_trg**
  - Table: `social.user_connections`
  - Calls function: `social.update_connection_timestamp`
  - Updates timestamp on connection changes.

## groups.event_rsvps

- **update_rsvp_timestamp_trg**
  - Table: `groups.event_rsvps`
  - Calls function: `groups.update_rsvp_timestamp`
  - Refreshes RSVPs when updated.

---

## users.ui_preferences

- **trg_touch_ui_prefs**
  - Table: `users.ui_preferences`
  - Calls funciton: `users.touch_ui_prefs()`
  - updates updtated_at


CREATE TRIGGER trg_touch_privacy
BEFORE UPDATE ON users.privacy_settings
FOR EACH ROW
EXECUTE FUNCTION users.touch_privacy();


CREATE TRIGGER trg_tsv_musician_ads
BEFORE INSERT OR UPDATE
ON social.musician_ads
FOR EACH ROW
EXECUTE FUNCTION social.musician_ads_tsv_update();

CREATE TRIGGER trigger_create_profile AFTER UPDATE ON auth.users FOR EACH ROW WHEN (old.role::text IS DISTINCT FROM new.role::text) EXECUTE FUNCTION users.create_profile_when_authenticated()