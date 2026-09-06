// Pre-calculated nutrition for meals eaten often, so calories/macros don't
// have to be looked up or math'd by hand at log time. Values are calorie
// estimates (USDA-style for whole foods; published brand nutrition facts
// for chain items) — quantities scale them linearly via the Quick Add qty
// stepper. Edit freely if a real label/recipe differs.

export type FoodPreset = {
  key: string
  name: string
  quantity: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export const FOOD_PRESETS: FoodPreset[] = [
  { key: 'blueberries_pint', name: 'Blueberries', quantity: '1 pint', calories: 170, protein_g: 2, carbs_g: 43, fat_g: 1 },
  { key: 'pineapple_pint', name: 'Pineapple', quantity: '1 pint', calories: 160, protein_g: 2, carbs_g: 42, fat_g: 0 },
  { key: 'watermelon_pint', name: 'Watermelon', quantity: '1 pint', calories: 90, protein_g: 2, carbs_g: 22, fat_g: 0 },
  { key: 'siggis_yogurt', name: "Siggi's yogurt", quantity: '1 cup', calories: 170, protein_g: 15, carbs_g: 12, fat_g: 0 },
  { key: 'reds_burritos_2', name: "Red's burritos", quantity: '2', calories: 320, protein_g: 12, carbs_g: 34, fat_g: 12 },
  { key: 'kodiak_pancakes_3', name: 'Kodiak pancakes', quantity: '3 pancakes', calories: 210, protein_g: 14, carbs_g: 30, fat_g: 3 },
  { key: 'eggs_3', name: 'Eggs', quantity: '3', calories: 210, protein_g: 19, carbs_g: 1, fat_g: 14 },
  { key: 'sausage_patty', name: 'Sausage patty', quantity: '1', calories: 150, protein_g: 6, carbs_g: 1, fat_g: 13 },
  { key: 'bacon_3', name: 'Bacon', quantity: '3 strips', calories: 130, protein_g: 9, carbs_g: 0, fat_g: 10 },
  { key: 'overnight_oats', name: 'Overnight oats bottle', quantity: '1', calories: 250, protein_g: 10, carbs_g: 35, fat_g: 8 },
  { key: 'hashbrowns', name: 'Hashbrowns', quantity: '1 serving', calories: 150, protein_g: 2, carbs_g: 15, fat_g: 9 },
  { key: 'kodiak_cup', name: 'Kodiak on the go cup', quantity: '1', calories: 250, protein_g: 14, carbs_g: 33, fat_g: 6 },
  { key: 'granola_half_cup', name: 'Granola', quantity: '1/2 cup', calories: 240, protein_g: 5, carbs_g: 33, fat_g: 9 },
  { key: 'banana', name: 'Banana', quantity: '1', calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0 },
  { key: 'avocado', name: 'Avocado', quantity: '1 whole', calories: 250, protein_g: 3, carbs_g: 13, fat_g: 22 },
  { key: 'wawa_burrito', name: 'Wawa breakfast burrito', quantity: '1', calories: 600, protein_g: 24, carbs_g: 42, fat_g: 34 },
  { key: 'cfa_nuggets_12', name: 'Chick-fil-A 12ct nuggets', quantity: '12ct', calories: 380, protein_g: 40, carbs_g: 16, fat_g: 17 },
  { key: 'blueberry_muffin', name: 'Blueberry muffin', quantity: '1', calories: 350, protein_g: 5, carbs_g: 54, fat_g: 14 },
  { key: 'kachava_shake', name: "Ka'Chava shake", quantity: '1 serving', calories: 240, protein_g: 25, carbs_g: 26, fat_g: 6 },
  {
    key: 'five_guys_burger',
    name: 'Five Guys burger — double, cheese, LTO, jalapeños, mayo, ketchup, relish',
    quantity: '1',
    calories: 1120,
    protein_g: 47,
    carbs_g: 49,
    fat_g: 66,
  },
]
