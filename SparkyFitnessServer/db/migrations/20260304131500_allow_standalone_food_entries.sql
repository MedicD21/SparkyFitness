ALTER TABLE public.food_entries
DROP CONSTRAINT IF EXISTS chk_food_or_meal_id;

ALTER TABLE public.food_entries
ADD CONSTRAINT chk_food_or_meal_id CHECK (
  ((food_id IS NOT NULL) AND (meal_id IS NULL)) OR
  ((food_id IS NULL) AND (meal_id IS NOT NULL)) OR
  (
    (food_id IS NULL) AND
    (meal_id IS NULL) AND
    (food_name IS NOT NULL) AND
    (serving_size IS NOT NULL) AND
    (serving_unit IS NOT NULL) AND
    (calories IS NOT NULL)
  )
);
