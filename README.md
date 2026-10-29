# SimpleRaise Growth Planner

A single-file annual revenue, audience allocation, and seasonal workload calculator.

## Edit and preview

The source is `outputs/simpleraise-planner.html`. Open it directly in a browser. All CSS and JavaScript are inline; there are no dependencies, database, or backend.

Inputs update calculations in the browser. Changes are not saved or shared between visitors; reloading restores defaults.

## Publish

Pushing to `main` deploys the HTML as `index.html` through GitHub Actions and GitHub Pages. Only that file is published; screenshots and working files are excluded.

Public site: https://lessallan.github.io/simpleraise-growth-planner/

The calculator and embedded financial figures are intentionally public. Planning assumptions are not measured forecasts. Staffing uses weekdays and editable working hours; email labor, holidays, and existing workload are not included.

## Execution plan

The calculator’s execution section has By month and By program views. Both
render the same acquisition events: email dates, signup
deadlines, and proposed weekly campaign webinars. Active windows appear beside
each program. Monthly totals count
first contacts and signup targets once, with cumulative signups across months.
Both views include expandable dated email drafts with signup and webinar links.

Targets use the program mix and funnel inputs. Timing uses the shared outreach
settings, including one to three emails, spacing, signup buffer. Season-based signup deadlines precede the season; year-round programs
use their editable reach-out dates. Annual targets split across those campaigns.
Capacity calculations remain separate from acquisition execution targets.

Drafts do not send email. Replace the signup and webinar link placeholders and review copy
before use. Navigation preserves in-page inputs; reloading restores defaults.
The old #prospecting link opens the execution section in By program view.

Acquisition reach minimums count prospects receiving the main email blast.
Emails 2 and 3 go only to prospects who have not signed up, excluding opt-outs
and pausing for replies. Follow-up recipient counts are intentionally not shown. Each campaign offers at least
one proposed webinar every seven days from shortly after first outreach through
the signup deadline. Session times and registration URLs are not yet confirmed.

## Approved holiday blockouts

Execution calendars block emails and webinars on November 23–29, 2026 and
December 21, 2026–January 3, 2027. Both calendar views display the dates.
Emails move forward to available weekdays with at least the configured spacing;
original email and signup dates remain visible when changed. Signup targets retain
the final-email buffer, even during blockouts, and show a warning when shifted.
Webinars follow the revised first outreach date and weekly cadence, skipping
blocked weeks. These dates do not recur automatically in subsequent years.
Staffing estimates remain a separate model and do not reflect holiday shifts.
This is a planning calendar, not a connected sending or webinar booking system.
