create policy "Users can select their mood rating entries"
on "public"."mood_rating_entries"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));



