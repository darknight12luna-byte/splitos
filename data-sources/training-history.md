<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Now convert the extracted training history into a normalized app database.

Create:

- a unique exercise catalog
- a unique movement-technique catalog
- a weekly program structure
- reusable workout templates
- progression rules
- media reference fields
- coach notes fields
- beginner instruction fields

For each exercise, add:

- slug
- category
- movement pattern
- equipment
- difficulty level
- primary muscles
- secondary muscles
- execution steps
- cues
- mistakes
- regressions
- progressions
- default sets/reps/rest
- media_reference
- recommended_search_query

Then output:

1. clean markdown tables
2. clean JSON schema
3. sample records ready to import into a web app

Below is a normalized app-database version of your training history and coaching system, structured for reuse in a web app. The schema separates **exercise catalog**, **movement-technique catalog**, **weekly program structure**, **workout templates**, and **progression rules**, which is the right pattern for avoiding duplication and supporting reusable templates, linked media, and beginner coaching layers.[^1]

## Exercise catalog

| slug | name | category | movement_pattern | equipment | difficulty | primary_muscles | secondary_muscles | default_sets | default_reps | default_rest | media_reference | recommended_search_query |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | --: | :-- | :-- | :-- | :-- |
| flat-db-bench-press | Flat DB Bench Press | strength | horizontal_push | dumbbells, flat_bench | beginner_intermediate | chest | front_delts, triceps | 3-4 | 8-12 | 90s | null | `flat dumbbell bench press form` |
| seated-row | Seated Row | strength | horizontal_pull | row_machine_or_cable | beginner_intermediate | mid_back, lats | rear_delts, biceps | 3-4 | 8-10 | 75-90s | null | `seated row machine proper form` |
| lat-pulldown | Lat Pulldown | strength | vertical_pull | lat_pulldown_machine | beginner_intermediate | lats | upper_back, biceps | 3-4 | 8-10 | 75-90s | null | `lat pulldown chest up form` |
| db-shoulder-press | DB Shoulder Press | strength | vertical_push | dumbbells, bench | beginner_intermediate | delts | triceps, upper_chest | 2-4 | 8-10 | 75-90s | null | `seated dumbbell shoulder press form` |
| cable-lateral-raise | Cable Lateral Raise | accessory | shoulder_abduction | cable_machine | beginner | lateral_delts | upper_traps | 2-3 | 10-15 | 60s | null | `cable lateral raise form` |
| cable-triceps-pressdown | Cable Triceps Pressdown | accessory | elbow_extension | cable_machine | beginner | triceps | shoulders_stabilizers | 2-3 | 10-12 | 60s | null | `cable triceps pressdown form` |
| db-hammer-curl | DB Hammer Curl | accessory | elbow_flexion | dumbbells | beginner | brachialis, biceps | forearms | 2-3 | 10-12 | 60s | null | `hammer curl dumbbell form` |
| panatta-chest-press | Panatta Chest Press | machine_strength | horizontal_push | panatta_machine | beginner_intermediate | chest | triceps, front_delts | 2-4 | 10 | null | null | `panatta chest press form` |
| pectoral-machine | Pectoral Machine | machine_strength | chest_isolation_or_press | machine | beginner | chest | front_delts | 2-3 | 10-20 | null | null | `pectoral machine exercise form` |
| hanging-knee-raise | Hanging Knee Raise | core | trunk_flexion | hanging_station | beginner_intermediate | abs | hip_flexors, grip | 2 | 10 | 45-60s | null | `hanging knee raise form` |
| rowing-machine | Rowing Machine | conditioning | cyclical_full_body_pull | rower | beginner | posterior_chain, back | legs, arms, cardio_system | null | time_or_strokes | null | null | `indoor rowing machine technique` |
| leg-press | Leg Press | strength | squat_pattern | leg_press_machine | beginner_intermediate | quads, glutes | adductors | 4 | 10 | 90s | null | `leg press knees over toes form` |
| leg-curl | Seated or Lying Leg Curl | accessory | knee_flexion | leg_curl_machine | beginner | hamstrings | calves | 3 | 10-12 | 60-75s | null | `leg curl machine proper form` |
| db-romanian-deadlift | DB Romanian Deadlift | strength | hip_hinge | dumbbells | beginner_intermediate | hamstrings, glutes | spinal_erectors, grip | 3 | 10 | 90s | null | `dumbbell romanian deadlift form` |
| standing-calf-raise | Standing Calf Raise | accessory | ankle_plantarflexion | calf_raise_machine | beginner | calves | foot_stabilizers | 3 | 12-15 | 60s | null | `standing calf raise form` |
| glute-bridge | Glute Bridge | accessory | hip_extension | floor | beginner | glutes | hamstrings, core | 2 | 12 | 45-60s | null | `glute bridge form` |
| cable-crunch | Cable Crunch | core | trunk_flexion | cable_machine | beginner | abs | obliques | 2-3 | 12 | 45-60s | null | `cable crunch form` |
| dead-bug | Dead Bug | core | anti_extension | floor | beginner | deep_core, abs | hip_flexors, shoulder_stabilizers | 2 | 8_side | 30s | null | `dead bug exercise tutorial` |
| scapular-push-up | Scapular Push-up | warmup | scapular_control | floor | beginner | serratus_anterior | chest, shoulders | 2 | 10 | 30-45s | null | `scapular push up form` |
| band-pull-apart | Band Pull-Apart | warmup | scapular_retraction | resistance_band | beginner | rear_delts, upper_back | rotator_cuff | 2 | 15 | 30-45s | null | `band pull apart form` |
| arm-circles | Arm Circles | warmup | shoulder_mobility | bodyweight | beginner | shoulders | upper_back | 1-2 | 15_each | null | null | `arm circles shoulder warm up` |
| wrist-circles-finger-pumps | Wrist Circles + Finger Pumps | mobility | wrist_mobility | bodyweight | beginner | wrists, forearms | hands | 1 | 1-2_min | null | null | `wrist warm up for animal flow` |
| beast-rock | Beast Rock | animal_flow_prep | quadrupedal_activation | floor | beginner | core, shoulders | wrists, hips | 2 | 20s | 30s | null | `beast rock animal flow` |
| treadmill-walk | Treadmill Walk | conditioning | steady_state_gait | treadmill | beginner | legs, cardio_system | calves, core | null | time_or_distance | null | null | `treadmill walking warm up pace` |
| cooldown-walk | Cooldown Walk | conditioning | steady_state_gait | treadmill_or_floor | beginner | legs, cardio_system | calves | null | time | null | null | `post workout cooldown walk pace` |
| leg-swings | Leg Swings | warmup | hip_mobility | bodyweight | beginner | hip_flexors, hamstrings | glutes, adductors | 1-2 | 10-15_each | null | null | `leg swings dynamic warm up` |
| bodyweight-squat | Bodyweight Squat | warmup | squat_pattern | bodyweight | beginner | quads, glutes | hamstrings, core | 1-2 | 10-15 | null | null | `bodyweight squat warm up form` |
| walking | Walking | recovery | steady_state_gait | outdoor_or_treadmill | beginner | legs, cardio_system | calves, core | null | time | null | null | `easy pace recovery walk` |
| light-jogging | Light Jogging | conditioning | steady_state_gait | outdoor_or_treadmill | beginner | legs, cardio_system | calves | null | time | null | null | `light jogging technique beginner` |

Rows below "beast-rock" were added during the V2 upgrade: the original extraction left these as unlabeled tokens inside template chains (e.g. `treadmill_walk`, `cooldown_walk`) with no catalog definition. The user confirmed these are real parts of their training and specified they need duration+speed tracking, so they were added as proper catalog entries rather than left unresolved.

All Animal Flow uses quadrupedal loading, contralateral coordination, wrist mobilization, and activation sequencing as foundational pillars, so separating those from standard strength lifts in your app will make exercise search and session generation cleaner.[^1]

## Movement-technique catalog

| slug | name | technique_type | parent_system | difficulty | what_it_trains | beginner_instruction | key_cues | common_mistakes | progression_path | media_reference | recommended_search_query |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| static-beast | Static Beast | activation | animal_flow | beginner | deep_core, shoulder_stability, anti_rotation | Hover knees one inch off floor and keep torso quiet. | fingers_wide, shoulders_packed, knees_low | hips_too_high, weight_shift, soft_shoulders | beast_limb_lifts -> beast_rock -> transitions [^1] | [Animal Flow Beast Activation](https://www.youtube.com/watch?v=7UgvqcNk-0Y) [^1] | `animal flow beast activation tutorial` |
| beast-side-kickthrough | Side Kickthrough | switch_transition | animal_flow | beginner_intermediate | rotational_power, shoulder_stability, hip_mobility | Start from Beast and move slowly one side at a time. | straight_support_arm, shoulder_stack, heel_pivot, long_kick | bent_support_arm, rushed_rotation, no_pivot | slow_reps -> linked_reps -> levitating_side_kickthrough [^1] | [Animal Flow Side Kickthrough](https://www.youtube.com/watch?v=kPHVAKZ0x90) [^1] | `animal flow side kickthrough tutorial` |
| table-hand-foot-tap-hip-slide | Table Hand-Foot Tap + Hip Slide | mobility_transition | primal_movement | beginner | core, shoulders, hamstrings, coordination | Start with taps only before adding the hip slide. | hips_active, opposite_hand_to_foot, move_slowly | hips_drop, rushing | taps_only -> taps_plus_slide -> longer_intervals | null | `animal flow tabletop opposite hand foot tap hip slide` |
| ninja-turn | Ninja Turn | transition | primal_movement | beginner_intermediate | coordination, trunk_control, shoulder_support | Break the move into phases instead of rushing the turn. | hand_support, controlled_rotation | momentum_only, unstable_hands | segmented_turn -> continuous_transition | null | `animal flow ninja turn transition tutorial` |
| knee-forward-squat-tap | Knee-Forward Squat Tap | mobility_drill | lower_mobility | beginner | knee_capacity, quads, balance | Use a small range first and keep control through the foot. | smooth_knee_travel, balance, control | knee_collapse, loss_of_balance | short_range -> deeper_range -> longer_sets | null | `knee forward squat tap mobility drill` |
| scapular-push-up-technique | Scapular Push-up Technique | prep_control | shoulder_prep | beginner | serratus_control, scapular_mobility | Move only the shoulder blades, not the elbows. | locked_elbows, neck_relaxed | elbow_bending, shrugging | incline_version -> floor_version -> higher_reps | null | `scapular push up technique` |
| wrist-mobilization | Wrist Mobilization | mobility_prep | animal_flow | beginner | wrist_tolerance, prep_for_loading | Start with gentle circles before loaded positions. | gradual_range, no_sharp_pain | skipping_prep, aggressive_loading | circles -> loaded_beast_prep | null | `wrist warm up quadrupedal training` |

Animal Flow is organized around six components—wrist mobilizations, activations, form-specific stretches, traveling forms, switches/transitions, and flows—so your movement-technique catalog should support that taxonomy separately from standard lifting exercises.[^1]

## Weekly structure

| week_day | session_type | goal | template_slug | frequency | notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Day 1 | Upper Body | Muscle density, push/pull balance, shoulders/back emphasis | upper-restart-template | weekly | First main gym day.[^1] |
| Day 2 | Lower Body | Lower strength, posterior chain, moderate fatigue | lower-animal-template | weekly | Keep hamstring volume controlled.[^1] |
| Day 3 | Recovery / Conditioning | Walking, mobility, or Animal Flow | recovery-conditioning-template | weekly_optional | Good place for low-fatigue work.[^1] |
| Day 4 | Upper Body | Repeat upper focus with progression | upper-benchmark-template | weekly | Use actual readiness.[^1] |
| Day 5 | Lower Body / Mixed | Lower plus primal finisher | lower-animal-template | weekly | Can be lighter if fatigue is high.[^1] |

## Reusable workout templates

| template_slug | template_name | category | exercise_order | beginner_instruction | coach_notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| upper-restart-template | Upper Restart Template | upper_body | treadmill_walk -> arm_circles -> band_pull_apart -> scapular_push_up -> wrist_circles_finger_pumps -> beast_rock -> flat_db_bench_press -> seated_row -> lat_pulldown -> db_shoulder_press -> cable_lateral_raise -> cable_triceps_pressdown -> db_hammer_curl -> beast_side_kickthrough -> dead_bug | Start lighter after a break and stop before junk volume. | Reduce load/volume 10–20% after pauses.[^1] |
| upper-benchmark-template | Upper Benchmark Template | upper_body | flat_db_bench_press -> panatta_chest_press -> seated_row -> lat_pulldown -> db_shoulder_press -> cable_lateral_raise -> cable_triceps_pressdown -> db_hammer_curl -> pectoral_machine | Use benchmark loads only when recovery is good. | Stronger full upper session, but avoid adding extra random pressing.[^1] |
| lower-animal-template | Lower + Animal Flow Template | mixed | treadmill_walk -> leg_swings -> bodyweight_squat -> wrist_circles_finger_pumps -> beast_rock -> leg_press -> leg_curl -> db_romanian_deadlift -> standing_calf_raise -> glute_bridge -> cable_crunch_or_dead_bug -> beast_side_kickthrough -> knee_forward_squat_tap -> cooldown_walk | Focus on control, not exhaustion. | Avoid excessive hamstring fatigue and keep quality high.[^1] |
| recovery-conditioning-template | Recovery / Conditioning Template | recovery | walking -> light_jogging_optional -> rowing_machine_optional -> wrist_mobility -> static_beast -> table_hand_foot_tap_hip_slide -> dead_bug | Keep this day easy enough to recover. | Use as active recovery, not as another hard gym day.[^1] |

## Progression rules

| rule_slug | rule_name | applies_to | logic | beginner_field | coach_note |
| :-- | :-- | :-- | :-- | :-- | :-- |
| restart-light | Restart After Pause | strength_templates | Reduce volume/intensity after a break before returning to benchmark loads. [^1] | `start_with_2_to_3_work_sets` | First workout back should not chase previous PR-level effort.[^1] |
| progress-by-readiness | Progress by Readiness | strength_exercises | Use previous successful loads as reference, but only progress when technique and recovery are good. [^1] | `repeat_same_load_before_adding_weight` | Readiness beats ego.[^1] |
| animal-flow-sequencing | Animal Flow Sequencing | movement_techniques | Progress from wrist prep -> activation -> transitions -> linked flow. [^1] | `master_static_positions_first` | Do not rush advanced flow transitions.[^1] |
| quality-before-volume | Quality Before Volume | all_templates | Stop adding exercises once useful work is done. [^1] | `end_session_when_form_drops` | Extra chest or random volume is not automatically better.[^1] |
| shoulder-protection | Shoulder Protection | pressing_and_kickthroughs | Reduce load or range if shoulder pain appears. [^1] | `use_pain_free_range` | Shoulder stacking matters in both pressing and kickthroughs.[^1] |

## JSON schema

```json
{
  "exercise_catalog": [
    {
      "slug": "string",
      "name": "string",
      "category": "strength|accessory|core|conditioning|warmup|mobility|animal_flow_prep|machine_strength",
      "movement_pattern": "string",
      "equipment": ["string"],
      "difficulty_level": "beginner|beginner_intermediate|intermediate",
      "primary_muscles": ["string"],
      "secondary_muscles": ["string"],
      "execution_steps": ["string"],
      "cues": ["string"],
      "mistakes": ["string"],
      "regressions": ["string"],
      "progressions": ["string"],
      "default_sets": "string|null",
      "default_reps": "string|null",
      "default_rest": "string|null",
      "media_reference": {
        "title": "string|null",
        "url": "string|null",
        "source": "string|null"
      },
      "recommended_search_query": "string",
      "coach_notes": ["string"],
      "beginner_instructions": ["string"]
    }
  ],
  "movement_technique_catalog": [
    {
      "slug": "string",
      "name": "string",
      "technique_type": "activation|mobility_transition|switch_transition|prep_control|mobility_prep|transition",
      "parent_system": "animal_flow|primal_movement|shoulder_prep|lower_mobility",
      "difficulty_level": "beginner|beginner_intermediate|intermediate",
      "what_it_trains": ["string"],
      "execution_steps": ["string"],
      "key_cues": ["string"],
      "common_mistakes": ["string"],
      "beginner_version": ["string"],
      "progression_version": ["string"],
      "suggested_frequency": "string|null",
      "suggested_dose": "string|null",
      "media_reference": {
        "title": "string|null",
        "url": "string|null",
        "source": "string|null"
      },
      "recommended_search_query": "string",
      "coach_notes": ["string"],
      "beginner_instructions": ["string"]
    }
  ],
  "weekly_program_structure": [
    {
      "day_label": "string",
      "session_type": "string",
      "goal": "string",
      "template_slug": "string",
      "frequency": "string",
      "notes": "string|null"
    }
  ],
  "workout_templates": [
    {
      "slug": "string",
      "name": "string",
      "category": "upper_body|lower_body|mixed|recovery",
      "exercise_order": ["string"],
      "movement_technique_order": ["string"],
      "default_duration": "string|null",
      "beginner_instructions": ["string"],
      "coach_notes": ["string"],
      "media_fields": {
        "hero_video": "string|null",
        "demo_playlist": ["string"]
      }
    }
  ],
  "progression_rules": [
    {
      "slug": "string",
      "name": "string",
      "applies_to": ["string"],
      "logic": "string",
      "coach_notes": ["string"],
      "beginner_instructions": ["string"]
    }
  ]
}
```

This schema keeps exercise records normalized and lets templates reference exercise slugs instead of duplicating technique text across sessions, which is a cleaner structure for long-term app maintenance.[^1]

## Sample records

### Sample exercise record

```json
{
  "slug": "flat-db-bench-press",
  "name": "Flat DB Bench Press",
  "category": "strength",
  "movement_pattern": "horizontal_push",
  "equipment": ["dumbbells", "flat_bench"],
  "difficulty_level": "beginner_intermediate",
  "primary_muscles": ["chest"],
  "secondary_muscles": ["front_delts", "triceps"],
  "execution_steps": [
    "Plant feet firmly on the floor.",
    "Set upper back and keep chest lifted.",
    "Lower dumbbells under control.",
    "Press back up smoothly without banging the dumbbells together."
  ],
  "cues": [
    "feet fixed",
    "chest up",
    "controlled lowering"
  ],
  "mistakes": [
    "unstable feet",
    "losing control on the descent",
    "using too much load after a break"
  ],
  "regressions": [
    "use 12.5 to 15 kg per hand",
    "reduce to 2 to 3 working sets"
  ],
  "progressions": [
    "return to 17.5 kg per hand for repeated work sets",
    "add reps before load when form is inconsistent"
  ],
  "default_sets": "3-4",
  "default_reps": "8-12",
  "default_rest": "90s",
  "media_reference": {
    "title": null,
    "url": null,
    "source": null
  },
  "recommended_search_query": "flat dumbbell bench press form",
  "coach_notes": [
    "reduce load if shoulder discomfort appears",
    "restart lighter after a pause"
  ],
  "beginner_instructions": [
    "focus on smooth reps before increasing load",
    "keep both feet planted throughout the set"
  ]
}
```


### Sample movement-technique record

```json
{
  "slug": "beast-side-kickthrough",
  "name": "Side Kickthrough",
  "technique_type": "switch_transition",
  "parent_system": "animal_flow",
  "difficulty_level": "beginner_intermediate",
  "what_it_trains": [
    "rotational_power",
    "shoulder_stability",
    "hip_mobility",
    "contralateral_coordination"
  ],
  "execution_steps": [
    "Start in Beast with knees hovering low.",
    "Support the body on one hand and the opposite foot.",
    "Pivot through the planted foot.",
    "Rotate the torso as the free leg kicks through.",
    "Keep the support arm straight and shoulder stacked over the wrist.",
    "Return to Beast and repeat on the other side."
  ],
  "key_cues": [
    "straight support arm",
    "shoulder stack",
    "heel pivot",
    "long kicking leg",
    "chest open"
  ],
  "common_mistakes": [
    "no pivot",
    "collapsed support shoulder",
    "rushing the rotation",
    "short weak kick"
  ],
  "beginner_version": [
    "practice slow single reps from static Beast",
    "pause between each side"
  ],
  "progression_version": [
    "link multiple smooth reps together",
    "progress toward faster but still controlled transitions",
    "advanced: levitating side kickthrough"
  ],
  "suggested_frequency": "1-4 times per week depending on program role",
  "suggested_dose": "2 x 4/side",
  "media_reference": {
    "title": "Animal Flow Side Kickthrough",
    "url": "https://www.youtube.com/watch?v=kPHVAKZ0x90",
    "source": "mentioned in space materials"
  },
  "recommended_search_query": "animal flow side kickthrough tutorial",
  "coach_notes": [
    "do wrist prep first",
    "quality matters more than speed"
  ],
  "beginner_instructions": [
    "slow down and own the support position before trying flow",
    "do not force range if the shoulder feels unstable"
  ]
}
```


### Sample workout template record

```json
{
  "slug": "upper-restart-template",
  "name": "Upper Restart Template",
  "category": "upper_body",
  "exercise_order": [
    "flat-db-bench-press",
    "seated-row",
    "lat-pulldown",
    "db-shoulder-press",
    "cable-lateral-raise",
    "cable-triceps-pressdown",
    "db-hammer-curl",
    "dead-bug"
  ],
  "movement_technique_order": [
    "wrist-mobilization",
    "static-beast",
    "beast-side-kickthrough"
  ],
  "default_duration": "50-70 min",
  "beginner_instructions": [
    "start lighter after time off",
    "stop when form quality drops"
  ],
  "coach_notes": [
    "avoid junk volume",
    "do not force benchmark loads on restart week"
  ],
  "media_fields": {
    "hero_video": null,
    "demo_playlist": [
      "https://www.youtube.com/watch?v=kPHVAKZ0x90",
      "https://www.youtube.com/watch?v=7UgvqcNk-0Y"
    ]
  }
}
```


### Sample progression rule record

```json
{
  "slug": "animal-flow-sequencing",
  "name": "Animal Flow Sequencing",
  "applies_to": [
    "movement_technique_catalog",
    "workout_templates"
  ],
  "logic": "Progress from wrist prep to activation, then transitions, then linked flow. Do not skip the static control stage.",
  "coach_notes": [
    "master base positions before advanced transitions",
    "tempo control is a progression tool"
  ],
  "beginner_instructions": [
    "own the Beast position first",
    "use slow reps before chaining movements together"
  ]
}
```


## Implementation notes

For your app, the cleanest database design is:

- `exercise_catalog`
- `movement_technique_catalog`
- `workout_templates`
- `weekly_program_structure`
- `progression_rules`
- optional join tables like:
    - `template_exercises`
    - `template_movements`
    - `exercise_media`
    - `coach_notes`
    - `session_logs`.[^1]

That separation will let you reuse one exercise definition across many sessions, keep beginner instructions centralized, and attach Animal Flow media/tutorial fields without mixing them into every workout log.[^1]

<div align="center">⁂</div>

[^1]: Detailed-Animal-Flow-Training-Plan.pdf

