# TuneBridge Backend Functions Overview

## Auto-creation & Uniqueness

- **Automatically creates a user profile upon authentication if it does not already exist.**  
  `CREATE OR REPLACE FUNCTION users.create_profile_when_authenticated()`

- **Prevents duplicate usernames in the profiles table.**  
  `CREATE OR REPLACE FUNCTION users.prevent_duplicate_usernames()`

---

## Search Index Maintenance (Profiles)

- **Updates the searchable content field for a profile based on basic fields (username, name, email, location, bio).**  
  `CREATE OR REPLACE FUNCTION users.update_profile_content_search()`

- **Updates the content_search_roles field in profiles when roles related to a profile change.**  
  `CREATE OR REPLACE FUNCTION users.update_content_search_roles_trigger()`

- **Updates the content_search_details field in profiles when hashtags or related details change.**  
  `CREATE OR REPLACE FUNCTION social.refresh_profile_content_search_details()`

- **Aggregates multiple search vectors into a single comprehensive content_search_all field in profiles.**  
  `CREATE OR REPLACE FUNCTION users.update_content_search_all()`

---

## [users.profiles] – Profile Matching
- **Calculates a similarity score between two profiles based on shared content tokens.**
  `CREATE OR REPLACE FUNCTION users.profile_match_score(profile_a UUID, profile_b UUID)`

- **Returns a list of matching profiles ordered by similarity to the given profile.**
  `CREATE OR REPLACE FUNCTION users.profile_match_all(profile_a UUID, limit_results INT DEFAULT 10)`
  
---

## [users.profile_group_members] – Profile Groups

- **Automatically adds the creator of a group as an admin in the group members table.**  
  `CREATE OR REPLACE FUNCTION add_creator_to_group_members()`

- **Reassigns a new admin when the last admin leaves a group.**  
  `CREATE OR REPLACE FUNCTION users.reassign_admin_on_leave()`

- **Validates that no duplicate roles exist in roles_in_group array.**  
  `CREATE OR REPLACE FUNCTION users.roles_in_group_no_duplicates(roles TEXT[])`

---

## [users.ui_preferences] [users.privacy_settings] – UI and Privacy Updates

- **Updates the timestamp when a user's UI preferences change.**
  `CREATE OR REPLACE FUNCTION users.touch_ui_prefs()`

- **Updates the timestamp when a user's privacy settings change.**
  `CREATE OR REPLACE FUNCTION users.touch_privacy()`

  ---

## [social.notifications] – Notification Triggers

- **Sends a notification when a comment is made on a post.**  
  `CREATE OR REPLACE FUNCTION social.notify_comment()`

- **Sends a notification when a post is liked.**  
  `CREATE OR REPLACE FUNCTION social.notify_like()`

- **Sends a notification when a follow request is created.**  
  `CREATE OR REPLACE FUNCTION social.notify_follow_request()`

- **Sends a notification when a user joins a group.**  
  `CREATE OR REPLACE FUNCTION users.notify_profile_group_join()`

- **Sends notifications when a user leaves or is removed from a group.**  
  `CREATE OR REPLACE FUNCTION users.notify_profile_group_leave()`

---

## [social.messages & chat] – Conversations & Messaging

- **Soft deletes a message by setting the deleted_at timestamp.**  
  `CREATE OR REPLACE FUNCTION social.soft_delete_message()`

- **Updates the timestamp when a message is updated.**  
  `CREATE OR REPLACE FUNCTION social.update_message_timestamp()`

- **Deletes all messages when a conversation is deleted.**  
  `CREATE OR REPLACE FUNCTION delete_messages_on_conversation_delete()`

- **Assigns the conversation creator as admin when a conversation is converted into a group.**  
  `CREATE OR REPLACE FUNCTION social.set_creator_as_admin()`

- **Prevents adding the same participant to a conversation more than once.**  
  `CREATE OR REPLACE FUNCTION social.prevent_duplicate_participants()`

- **Finds an existing one-on-one conversation between two profiles.**  
  `CREATE OR REPLACE FUNCTION social.find_one_on_one_conversation(profile_a UUID, profile_b UUID)`

---

## [social.posts & comments] – Posts, Likes, Comments

- **Prevents duplicate likes on the same post or comment by the same user.**  
  `CREATE OR REPLACE FUNCTION social.prevent_duplicate_likes()`

- **Toggles like on post or comment: deletes if exists, inserts otherwise.**  
  `CREATE OR REPLACE FUNCTION social.update_like_status()`

- **Updates the timestamp when a comment is updated.**  
  `CREATE OR REPLACE FUNCTION social.update_comment_timestamp()`

- **Updates the content_search field for a post when its hashtags, title or content change.**  
  `CREATE OR REPLACE FUNCTION social.refresh_post_content_search()`

- **Updates the timestamp when a post is updated.**  
  `CREATE OR REPLACE FUNCTION social.update_post_timestamp()`

---

## [social.connections] – Profile Connections

- **Updates the timestamp when a connection is updated.**  
  `CREATE OR REPLACE FUNCTION social.update_connection_timestamp()`

- **Ensures only one connection per follower_profile_id by deleting existing entries.**  
  `CREATE OR REPLACE FUNCTION social.check_and_delete_duplicate()`

---

## [groups.event_rsvps] – Calendar Events

- **Updates event_rsvps.updated_at to the current date.**  
  `CREATE OR REPLACE FUNCTION groups.update_rsvp_timestamp()`
