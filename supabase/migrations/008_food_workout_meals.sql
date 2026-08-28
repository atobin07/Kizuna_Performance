-- Kizuna Performance — add pre/intra/post-workout meal categories to food logs.
-- Apply after 007_strength_increments.sql

alter table public.food_logs drop constraint food_logs_meal_check;
alter table public.food_logs add constraint food_logs_meal_check
  check (meal in ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'intra_workout', 'post_workout'));
