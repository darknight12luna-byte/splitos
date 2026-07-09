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
| flat-db-bench-press | Flat DB Bench Press | strength | horizontal_push | dumbbells, flat_bench | beginner_intermediate | chest | front_delts, triceps | 3-4 | 8-12 | 90s | [How to Dumbbell Flat Bench Press - Form Tutorial](https://www.youtube.com/watch?v=i1fywF_g-1U) | `flat dumbbell bench press form` |
| seated-row | Seated Row | strength | horizontal_pull | row_machine_or_cable | beginner_intermediate | mid_back, lats | rear_delts, biceps | 3-4 | 8-10 | 75-90s | [Seated Cable Row - Exercise Tutorial](https://www.youtube.com/watch?v=6hvQh3muYB8) | `seated row machine proper form` |
| lat-pulldown | Lat Pulldown | strength | vertical_pull | lat_pulldown_machine | beginner_intermediate | lats | upper_back, biceps | 3-4 | 8-10 | 75-90s | [How to do Lat Pulldowns](https://www.youtube.com/watch?v=SALxEARiMkw) | `lat pulldown chest up form` |
| db-shoulder-press | DB Shoulder Press | strength | vertical_push | dumbbells, bench | beginner_intermediate | delts | triceps, upper_chest | 2-4 | 8-10 | 75-90s | [Dumbbell Shoulder Press - Exercise Guide](https://www.youtube.com/watch?v=0JfYxMRsUCQ) | `seated dumbbell shoulder press form` |
| cable-lateral-raise | Cable Lateral Raise | accessory | shoulder_abduction | cable_machine | beginner | lateral_delts | upper_traps | 2-3 | 10-15 | 60s | [How to PROPERLY Cable Lateral Raise](https://www.youtube.com/watch?v=qitQHqNZbeM) | `cable lateral raise form` |
| cable-triceps-pressdown | Cable Triceps Pressdown | accessory | elbow_extension | cable_machine | beginner | triceps | shoulders_stabilizers | 2-3 | 10-12 | 60s | [Cable Triceps Pushdown: 3 Golden Rules](https://www.youtube.com/watch?v=_w-HpW70nSQ) | `cable triceps pressdown form` |
| db-hammer-curl | DB Hammer Curl | accessory | elbow_flexion | dumbbells | beginner | brachialis, biceps | forearms | 2-3 | 10-12 | 60s | [Dumbbell Hammer Curls Tutorial](https://www.youtube.com/watch?v=4BRAf2BajWw) | `hammer curl dumbbell form` |
| panatta-chest-press | Panatta Chest Press | machine_strength | horizontal_push | panatta_machine | beginner_intermediate | chest | triceps, front_delts | 2-4 | 10 | null | null | `panatta chest press form` |
| pectoral-machine | Pectoral Machine | machine_strength | chest_isolation_or_press | machine | beginner | chest | front_delts | 2-3 | 10-20 | null | null | `pectoral machine exercise form` |
| hanging-knee-raise | Hanging Knee Raise | core | trunk_flexion | hanging_station | beginner_intermediate | abs | hip_flexors, grip | 2 | 10 | 45-60s | null | `hanging knee raise form` |
| rowing-machine | Rowing Machine | conditioning | cyclical_full_body_pull | rower | beginner | posterior_chain, back | legs, arms, cardio_system | null | time_or_strokes | null | null | `indoor rowing machine technique` |
| leg-press | Leg Press | strength | squat_pattern | leg_press_machine | beginner_intermediate | quads, glutes | adductors | 4 | 10 | 90s | [How to PROPERLY Leg Press](https://www.youtube.com/watch?v=K5n2vg3oZa4) | `leg press knees over toes form` |
| leg-curl | Seated or Lying Leg Curl | accessory | knee_flexion | leg_curl_machine | beginner | hamstrings | calves | 3 | 10-12 | 60-75s | [Exercise Tutorial: Technogym Seated Leg Curl Machine](https://www.youtube.com/watch?v=IOufFLwNOTU) | `leg curl machine proper form` |
| db-romanian-deadlift | DB Romanian Deadlift | strength | hip_hinge | dumbbells | beginner_intermediate | hamstrings, glutes | spinal_erectors, grip | 3 | 10 | 90s | [How to do romanian deadlifts safely](https://www.youtube.com/watch?v=ZEnWV4kguKc) | `dumbbell romanian deadlift form` |
| standing-calf-raise | Standing Calf Raise | accessory | ankle_plantarflexion | calf_raise_machine | beginner | calves | foot_stabilizers | 3 | 12-15 | 60s | [Standing Calf Raise - Exercise Tutorial](https://www.youtube.com/watch?v=EmyjIRHl3CU) | `standing calf raise form` |
| glute-bridge | Glute Bridge | accessory | hip_extension | floor | beginner | glutes | hamstrings, core | 2 | 12 | 45-60s | [How To Do A Glute Bridge](https://www.youtube.com/watch?v=wPM8icPu6H8) | `glute bridge form` |
| cable-crunch | Cable Crunch | core | trunk_flexion | cable_machine | beginner | abs | obliques | 2-3 | 12 | 45-60s | null | `cable crunch form` |
| dead-bug | Dead Bug | core | anti_extension | floor | beginner | deep_core, abs | hip_flexors, shoulder_stabilizers | 2 | 8_side | 30s | [How to PROPERLY Do Deadbugs](https://www.youtube.com/watch?v=lqnuY3wiBzA) | `dead bug exercise tutorial` |
| scapular-push-up | Scapular Push-up | warmup | scapular_control | floor | beginner | serratus_anterior | chest, shoulders | 2 | 10 | 30-45s | [Exercise With an Athletic Trainer: Scapular Pushups](https://www.youtube.com/watch?v=LeMk15TN0No) | `scapular push up form` |
| band-pull-apart | Band Pull-Apart | warmup | scapular_retraction | resistance_band | beginner | rear_delts, upper_back | rotator_cuff | 2 | 15 | 30-45s | [How to Do Band Pull-Aparts (Shoulder + Upper Back Strength)](https://www.youtube.com/watch?v=ZAqlGLJkeZU) | `band pull apart form` |
| arm-circles | Arm Circles | warmup | shoulder_mobility | bodyweight | beginner | shoulders | upper_back | 1-2 | 15_each | null | [Workout Warm-Up - Arm Circles](https://www.youtube.com/watch?v=mwDgFY86zck) | `arm circles shoulder warm up` |
| wrist-circles-finger-pumps | Wrist Circles + Finger Pumps | mobility | wrist_mobility | bodyweight | beginner | wrists, forearms | hands | 1 | 1-2_min | null | [Animal Flow Tutorial: Wrist Mobilizations](https://www.youtube.com/watch?v=I9bYCIfG-go) | `wrist warm up for animal flow` |
| beast-rock | Beast Rock | animal_flow_prep | quadrupedal_activation | floor | beginner | core, shoulders | wrists, hips | 2 | 20s | 30s | null | `beast rock animal flow` |
| treadmill-walk | Treadmill Walk | conditioning | steady_state_gait | treadmill | beginner | legs, cardio_system | calves, core | null | time_or_distance | null | [How To: Incline Treadmill Walk (12-3-30 Workout)](https://www.youtube.com/watch?v=NAsObfFJXvE) | `treadmill walking warm up pace` |
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
| knee-forward-squat-tap | Knee-Forward Squat Tap | mobility_drill | lower_mobility | beginner | knee_capacity, quads, balance | Use a small range first and keep control through the foot. | smooth_knee_travel, balance, control | knee_collapse, loss_of_balance | short_range -> deeper_range -> longer_sets | [Knee Tap Squats - hip mobility exercise](https://www.youtube.com/watch?v=D5Mq3ysh7pA) | `knee forward squat tap mobility drill` |
| scapular-push-up-technique | Scapular Push-up Technique | prep_control | shoulder_prep | beginner | serratus_control, scapular_mobility | Move only the shoulder blades, not the elbows. | locked_elbows, neck_relaxed | elbow_bending, shrugging | incline_version -> floor_version -> higher_reps | [Exercise With an Athletic Trainer: Scapular Pushups](https://www.youtube.com/watch?v=LeMk15TN0No) | `scapular push up technique` |
| wrist-mobilization | Wrist Mobilization | mobility_prep | animal_flow | beginner | wrist_tolerance, prep_for_loading | Start with gentle circles before loaded positions. | gradual_range, no_sharp_pain | skipping_prep, aggressive_loading | circles -> loaded_beast_prep | [Animal Flow Tutorial: Wrist Mobilizations](https://www.youtube.com/watch?v=I9bYCIfG-go) | `wrist warm up quadrupedal training` |
| crab-reach | Crab Reach | extension_reach | animal_flow | beginner_intermediate | shoulder_mobility, thoracic_rotation, glute_activation | Practice three-point bridge first before adding the reach. | drive_hips_up, squeeze_glute_at_top, head_follows_hand | sagging_hips, skipped_head_turn, rushed_return | three_point_bridge -> single_reach -> full_flowing_crab_reach [^1] | [Animal Flow Crab Reach](https://www.youtube.com/watch?v=GzeyBUJdWw0) [^1] | `animal flow crab reach tutorial` |

| underswitch | Underswitch | switch_transition | animal_flow | beginner_intermediate | rotational_control, shoulder_stability, hip_mobility | Break the transition into two slow phases before linking it. | continuous_hip_rotation, stable_support_leg, controlled_pivot | rushed_pivot, hips_leading_late, collapsed_support_arm | phased_reps -> linked_reps -> flowing_transition | [Animal Flow Movement Tutorial: Underswitch](https://www.youtube.com/watch?v=JIKPCgIZh7E) | `animal flow underswitch tutorial` |
| thoracic-rotation | Thoracic Rotation | mobility_drill | lower_mobility | beginner | thoracic_mobility, rotational_control | Move slowly and keep the hips square throughout. | hips_stay_square, eyes_follow_hand, slow_control | rotating_from_hips, rushing_the_reps | short_range -> full_range -> loaded_variation | [11 Thoracic Spine Rotation Mobility Exercises](https://www.youtube.com/watch?v=h54us18qc20) | `thoracic rotation mobility drill` |
| pigeon-pose | Pigeon Pose | mobility_drill | lower_mobility | beginner | hip_mobility, hip_flexor_length | Only go as deep as feels comfortable, don't force range. | hips_stay_level, steady_breathing, front_hip_stays_closed | hips_rolling_open, forcing_depth, holding_breath | shallow_hold -> deeper_hold -> longer_duration | [How to do PIGEON Pose for beginners](https://www.youtube.com/watch?v=46phRH_09yM) | `pigeon pose hip flexor stretch` |
| deep-squat-hold | Deep Squat Hold | mobility_drill | lower_mobility | beginner | hip_mobility, ankle_mobility, squat_capacity | Use a wall or support in front of you if balance is difficult. | heels_stay_down, chest_lifted, knees_pressed_out | heels_lifting, rounded_spine, forcing_the_hold | supported_hold -> unsupported_hold -> longer_duration | [How to Deep Squat Hold](https://www.youtube.com/watch?v=0wzrgyAurT8) | `deep squat hold mobility` |
| spinal-wave | Spinal Wave | flow_drill | animal_flow | beginner_intermediate | spinal_mobility, segmental_control | Move slowly at first to feel each segment of the spine. | wave_starts_at_hips, arms_stay_stable, continuous_motion | rushing_the_wave, moving_from_arms_not_spine | segmented_wave -> continuous_wave -> flowing_wave | [Beast Wave Tutorial](https://www.youtube.com/watch?v=JQUf-7NJ3KY) | `spinal wave primal movement` |

Added during this session (2026-07-09): Crab Reach, Underswitch, Thoracic Rotation, Pigeon Pose,
Deep Squat Hold, and Spinal Wave were requested for the full UI rebuild but had no catalog entry
yet. Crab Reach's execution steps came directly from the user. The other five are common,
publicly-documented movements (not proprietary coaching content), so their execution steps below
were drafted by the assistant rather than pulled from this source — each carries an explicit
coach_notes flag saying so, and should be reviewed/edited by the user before being treated as
verified coaching content the way the rest of this catalog is.

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


### Sample movement-technique record

```json
{
  "slug": "static-beast",
  "execution_steps": [
    "Start on all fours: hands under shoulders, knees under hips, fingers spread wide.",
    "Tuck your toes under and brace your core, pulling belly button toward spine.",
    "Corkscrew the arms outward so the pit of each elbow faces forward.",
    "Press hands into the floor and lift the knees exactly one inch off the ground.",
    "Hold the position: knees low, hips level, spine neutral.",
    "Breathe steadily throughout — do not hold your breath."
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "table-hand-foot-tap-hip-slide",
  "execution_steps": [
    "Sit with knees bent, feet flat on the floor, hands planted behind the hips.",
    "Lift into the crab (table top) position.",
    "Lift one hand and the opposite foot, and tap them together above the body.",
    "Lower back to the crab position with control.",
    "Then slide the hips side to side while staying in a low crab position (the hip slide).",
    "Breathe naturally throughout."
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "wrist-mobilization",
  "execution_steps": [
    "Start kneeling or standing with hands in a prayer position.",
    "Roll the wrists in full circles: 10 reps each direction.",
    "Spread the fingers wide, press the palms flat on the floor, and make small waves through the hands.",
    "Place the hands on the floor with fingertips pointing back toward the knees and gently shift weight back.",
    "Rotate the fingertips to point sideways, then forward, shifting weight through each position.",
    "Finish with gentle fingertip push-ups: fingers on the ground, pulsing gently."
  ],
  "coach_notes": [
    "total duration 2 to 3 minutes",
    "beginner: gentle rolls only, avoid pain",
    "advanced: full floor wrist-loading positions"
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "scapular-push-up-technique",
  "execution_steps": [
    "Start in a high plank position: hands under shoulders, body in a straight line.",
    "Keep the arms straight throughout — this is not a regular push-up.",
    "Squeeze the shoulder blades together (retraction): the chest drops slightly between the arms.",
    "Push the shoulder blades apart (protraction): the upper back rounds slightly.",
    "Control both movements with a slow tempo, about 3 seconds each direction.",
    "Breathe in on retraction, out on protraction."
  ],
  "beginner_version": [
    "Do the movement from the knees instead of a full plank."
  ],
  "progression_version": [
    "knee_version",
    "full_plank_version",
    "pause_at_full_protraction"
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "crab-reach",
  "execution_steps": [
    "Sit with knees bent, feet flat, hands behind the hips with fingers pointing back or sideways.",
    "Press through the hands and feet to lift the hips off the floor into crab position.",
    "From crab, bring one arm across the body with the elbow bent, thumb near the nose.",
    "Drive the hips up high, squeezing the glutes, then reach that arm overhead toward the ground.",
    "Turn the head to follow the reaching hand.",
    "Return along the same path: the hand comes back first, then the hips lower."
  ],
  "key_cues": [
    "drive hips up",
    "squeeze glute at the top",
    "head follows the hand",
    "control the return"
  ],
  "common_mistakes": [
    "letting the hips sag low",
    "skipping the head turn",
    "rushing the return path"
  ],
  "beginner_version": [
    "Practice the three-point bridge first, without the reach."
  ],
  "progression_version": [
    "three_point_bridge",
    "single_reach",
    "full_flowing_crab_reach_both_sides"
  ],
  "media_reference": {
    "title": "Animal Flow Crab Reach",
    "url": "https://www.youtube.com/watch?v=GzeyBUJdWw0",
    "source": null
  }
}
```

### Sample exercise record

```json
{
  "slug": "scapular-push-up",
  "execution_steps": [
    "Start in a high plank position: hands under shoulders, body in a straight line.",
    "Keep the arms straight throughout — this is not a regular push-up.",
    "Squeeze the shoulder blades together (retraction): the chest drops slightly between the arms.",
    "Push the shoulder blades apart (protraction): the upper back rounds slightly.",
    "Control both movements with a slow tempo, about 3 seconds each direction.",
    "Breathe in on retraction, out on protraction."
  ],
  "cues": [
    "arms stay straight",
    "slow 3 second tempo each way",
    "breathe with the movement"
  ],
  "mistakes": [
    "bending the elbows",
    "shrugging instead of retracting/protracting",
    "moving too fast to control"
  ],
  "regressions": [
    "do the movement from the knees instead of a full plank"
  ],
  "progressions": [
    "add a pause at full protraction"
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "ninja-turn",
  "execution_steps": [
    "Start in Beast position with the knees hovering low.",
    "Shift weight into the hands and hop or step both feet outside the hands at the same time.",
    "Land in a low crouched \"ninja\" position, feet flat, knees bent, facing a new direction.",
    "Keep the chest up and the hands hovering, ready to catch balance.",
    "Reverse the same path to return to Beast, or keep rotating to link into a flow.",
    "Move with control before adding speed."
  ],
  "coach_notes": [
    "AI-drafted execution steps — review before relying on this as coaching content.",
    "the user's original description of this movement was cut off mid-sentence; these steps complete it from standard Animal Flow technique, not from the user's own notes"
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "knee-forward-squat-tap",
  "execution_steps": [
    "Start standing with feet hip-width apart.",
    "Shift weight onto one leg and bend that knee, driving it forward over the toes into a mini squat.",
    "Tap the opposite knee or foot lightly forward for balance, keeping the torso upright.",
    "Push back through the working leg to return to standing.",
    "Keep the movement slow and controlled, tracking the knee in line with the foot.",
    "Repeat on the other side."
  ],
  "coach_notes": [
    "AI-drafted execution steps — review before relying on this as coaching content.",
    "linked video is the closest match found, not an exact match for this specific drill"
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "underswitch",
  "execution_steps": [
    "Start in Beast position with the knees hovering low.",
    "Lift one hand and reach it underneath the body toward the opposite side, rotating the torso.",
    "As the hand plants on the far side, pivot the hips and let the body rotate into Crab position.",
    "Keep the support leg stable and the movement continuous through the hips.",
    "Reverse the same path to switch back from Crab to Beast.",
    "Move slowly at first, keeping the shoulders and hips moving in sync."
  ],
  "coach_notes": [
    "AI-drafted execution steps — review before relying on this as coaching content."
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "thoracic-rotation",
  "execution_steps": [
    "Start on all fours: hands under shoulders, knees under hips.",
    "Reach one arm underneath the body, rotating the torso and resting the shoulder and ear toward the floor.",
    "Hold briefly, feeling the stretch through the upper back.",
    "Reverse the motion, rotating the same arm up toward the ceiling, following it with your eyes.",
    "Keep the hips square and stationary throughout — the rotation comes from the upper spine.",
    "Repeat for reps, then switch sides."
  ],
  "coach_notes": [
    "AI-drafted execution steps — review before relying on this as coaching content."
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "pigeon-pose",
  "execution_steps": [
    "Start on all fours, then bring one knee forward and place it behind the same-side wrist, angling the shin across the body.",
    "Extend the opposite leg straight back behind you, hips square to the front.",
    "Walk the hands forward and lower the torso toward the floor as far as is comfortable.",
    "Keep the hips level — avoid letting the front hip roll open.",
    "Hold and breathe steadily, relaxing deeper into the stretch with each exhale.",
    "Return to all fours and repeat on the other side."
  ],
  "coach_notes": [
    "AI-drafted execution steps — review before relying on this as coaching content."
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "deep-squat-hold",
  "execution_steps": [
    "Stand with feet slightly wider than shoulder-width, toes turned out slightly.",
    "Lower into a full squat, hips dropping below knee height while keeping the heels on the floor.",
    "Bring the elbows inside the knees and gently press the knees outward with the elbows.",
    "Keep the chest lifted and the spine as tall as possible.",
    "Hold the position, breathing steadily, and rock gently side to side to open the hips.",
    "Use a wall or support in front of you if balance is difficult at first."
  ],
  "coach_notes": [
    "AI-drafted execution steps — review before relying on this as coaching content."
  ]
}
```

### Sample movement-technique record

```json
{
  "slug": "spinal-wave",
  "execution_steps": [
    "Start in Beast position with the knees hovering low.",
    "Begin the wave at the hips, tucking them under and rounding the lower back.",
    "Let the wave travel up the spine, rounding through the mid and upper back in sequence.",
    "Continue the motion into the neck and head, then reverse the wave from the head back down through the spine.",
    "Keep the arms stable and let the movement flow through the spine, not the limbs.",
    "Move slowly at first to feel each segment of the spine before increasing speed."
  ],
  "coach_notes": [
    "AI-drafted execution steps — review before relying on this as coaching content."
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

