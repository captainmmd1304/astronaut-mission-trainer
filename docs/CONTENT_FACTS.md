# Content facts (verified)

Last checked: 2026-11-06. Each fact lists its source. **Primary** = NASA/JPL/ESA or an official investigation report. **Secondary** = news or reference sites: fine for orientation, confirm in the primary source before showing a number to players.

Rule: if two sources disagree, trust the primary one, and never print a number marked secondary without confirming it.

## Jezero Crater (landing site content)

| Fact | Source | Type |
|---|---|---|
| Jezero is on the western edge of the Isidis Planitia basin, just north of the Martian equator, at roughly 18°N and 77°E | https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/landing_site/ | Primary |
| Perseverance landed in Jezero on 18 February 2021 | https://www.livescience.com/mars-jezero-crater-perseverance-photos.html | Secondary |
| The exact landing spot (Octavia E. Butler Landing) is about 18.44°N, 77.45°E | https://en.wikipedia.org/wiki/Octavia_E._Butler_Landing | Secondary |
| A HiRISE image centred at 18.462°N, 77.392°E shows the landing area (this is an image centre, not the landing point) | https://hirise.lpl.arizona.edu/ESP_073912_1985 | Primary |

Used in: `packages/content/src/sites/index.ts` (`jezero`). The coordinates there are 18.44, 77.45.

## 2018 global dust storm and Opportunity (historical scenario `dust-storm-2018`)

| Fact | Source | Type |
|---|---|---|
| Opportunity was designed for 90 days and operated from 2004 to 2019 | https://science.nasa.gov/missions/mer/nasas-opportunity-rover-mission-on-mars-comes-to-end | Primary |
| Its last communication with Earth was on 10 June 2018, as a planet-encircling dust storm covered the solar-powered rover's location | same NASA page | Primary |
| Controllers sent the last recovery commands late on 12 February 2019 | same NASA page | Primary |
| NASA declared the mission over on 13 February 2019 | same NASA page | Primary |
| Mechanism for the game: the dust blocked sunlight, so the solar panels could not keep the batteries charged | same NASA page (and widely reported) | Primary |

Watch out: some websites give wrong dates (for example 12 June 2018, or a storm "ending in October 2017"). Use the NASA dates above.

Design note: the game scenario is *inspired by* the storm. The sol numbers, magnitude and duration in `scenarios/index.ts` are game abstractions, not mission data. Say so in the UI.

## Black-box case file: Mars Climate Orbiter (1999)

| Fact | Source | Type |
|---|---|---|
| Launched 11 December 1998; lost on arrival, 23 September 1999 | https://science.nasa.gov/mission/mars-climate-orbiter | Primary |
| Root cause per the Mishap Investigation Board: a ground software file called "Small Forces" used English units where metric units were required, so thruster data was wrong in the trajectory model | https://discovery.larc.nasa.gov/PDF_FILES/MCO_report_2.pdf (Phase I report, 10 Nov 1999) | Primary |
| The small errors built up over the roughly nine-month trip to Mars | same report | Primary |
| The spacecraft's carrier signal was last seen at about 09:04:52 UTC on 23 September 1999 | same report | Primary |
| The board's chairman called the unit translation error the root cause, and also named other factors: weak end-to-end verification of navigation software, poor communication and training within the project, and a system view that was too narrow | https://spacenews.com/?p=27024 (reprint of NASA release 99-134) | Secondary reprint of a primary release |
| During final approach, first periapse was calculated as low as about 110 km; the minimum survivable altitude was about 80 km; the corrected after-the-fact estimate was about 57 km | https://discovery.larc.nasa.gov/PDF_FILES/MCO_report_2.pdf (Mishap Investigation Board Phase I report, pp. 12–13) | Primary |

Naming note: some pages say "Mars Climate Observer". The correct name is Mars Climate Orbiter.

Black-box story shape: the units mismatch is invisible in telemetry until late; evidence trail runs from the ground software file, to the trajectory estimates, to the low approach, to the lost signal.

## Black-box case file: Mars Polar Lander (1999)

| Fact | Source | Type |
|---|---|---|
| Launched 3 January 1999; lost on arrival 3 December 1999 (with the Deep Space 2 probes) | https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/ | Primary |
| NASA ended attempts to contact the lander on 17 January 2000 | NASA quick-facts page: https://science.nasa.gov/?p=106269 | Primary |
| The lander sent no telemetry during entry and landing, so the exact cause cannot be known with certainty | https://solarsystem.nasa.gov/system/internal_resources/details/original/3338_mpl_report_1.pdf (JPL Special Review Board report, executive summary) | Primary |
| Most probable cause (review boards, March 2000): landing-leg deployment produced a false touchdown signal, the software accepted it, and the descent engines shut off early | https://solarsystem.nasa.gov/system/internal_resources/details/original/3338_mpl_report_1.pdf (JPL Special Review Board report, sections 5.2 and 6.2.2) | Primary |
| The probable failure scenario places the spurious touchdown signal at landing-leg deployment, about 4.8 km altitude | https://spaceflightnow.com/news/0003/29marsreports/index.html (contemporary report quoting the Young board briefing) | Secondary: confirm in the primary report; the official JPL and Young PDFs located here state the deployment sequence and 40 m sensor-interrogation altitude but do not expose this 4.8 km figure in searchable text |
| The touchdown sensing logic was enabled at 40 m, at which point a spurious touchdown indication could terminate descent-engine thrust | https://solarsystem.nasa.gov/system/internal_resources/details/original/3338_mpl_report_1.pdf (JPL Special Review Board report, pp. 16 and 27) | Primary |
| At 40 m, loss of thrust would produce an estimated surface impact velocity of about 22 m/s, versus a nominal touchdown velocity of 2.4 m/s | https://solarsystem.nasa.gov/system/internal_resources/details/original/3338_mpl_report_1.pdf (JPL Special Review Board report, p. 27) | Primary |
| Underlying cause identified by the independent assessment: inadequate software design and system testing | https://ntrs.nasa.gov/api/citations/20000032458/downloads/20000032458.pdf (Mars Program Independent Assessment Team report, pp. 20–21) | Primary |
| Pre-launch tests used wrongly wired sensors, so the flaw was missed | https://solarsystem.nasa.gov/system/internal_resources/details/original/3338_mpl_report_1.pdf (JPL Special Review Board report, section 7.7.2) | Primary |

Primary reports to cite once you can open them: "Report on the Loss of the Mars Polar Lander and Deep Space 2 Missions" (JPL Special Review Board, JPL D-18709) and the Mars Program Independent Assessment Team (Young) summary report.

**Always label the cause as "most probable", never as certain.** The game's debrief wording should reflect that.

## Black-box case file: Schiaparelli (2016)

| Fact | Source | Type |
|---|---|---|
| ESA's Schiaparelli demonstrator was part of ExoMars 2016, launched 14 March 2016; it separated from the orbiter on 16 October and reached Mars on 19 October 2016 | https://www.esa.int/Newsroom/Schiaparelli_landing_investigation_completed | Primary |
| An independent ESA inquiry (published May 2017) found that conflicting information in the onboard computer ended the descent sequence early | same ESA page | Primary |
| After parachute deployment, the lander rotated faster than its inertial measurement unit (IMU) could measure, so the IMU saturated briefly | https://sci.esa.int/documents/33431/35950/1567260317467-ESA_ExoMars_2016_Schiaparelli_Anomaly_Inquiry.pdf (ESA inquiry, sections 5 and 6.3) | Primary |
| Result: the guidance software computed a wrong orientation and even a negative altitude (it believed it was already below ground) | https://sci.esa.int/documents/33431/35950/1567260317467-ESA_ExoMars_2016_Schiaparelli_Anomaly_Inquiry.pdf (ESA inquiry, pp. 12–14) | Primary |
| Root causes listed by the inquiry: insufficient parachute-dynamics modelling; inadequate IMU saturation-flag persistence and handling; insufficient failure detection, isolation and recovery; and problems managing subcontractors and accepting hardware | https://sci.esa.int/documents/33431/35950/1567260317467-ESA_ExoMars_2016_Schiaparelli_Anomaly_Inquiry.pdf (ESA inquiry, pp. 20 and 28) | Primary |
| Full report: ExoMars 2016 Schiaparelli Anomaly Inquiry, ref DG-I/2017/546/TTN | https://exploration.esa.int/web/mars/-/59176-exomars-2016-schiaparelli-anomaly-inquiry | Primary |

Black-box story shape: a short measurement overload (about a second), a software rule that trusted bad data, then a chain of correct-looking but wrong decisions.

## How to use this file

1. Before adding any real-world claim to `packages/content`, find it here or add it with a source.
2. Copy the primary source URL into the item's `sources` array.
3. Anything marked Secondary stays out of player-facing text until confirmed in a primary source.
4. Re-check dates and numbers if a scenario is edited.
