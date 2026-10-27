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
render the same acquisition events: preparation, approval, email dates, signup
deadlines, season readiness, and active-window boundaries. Monthly totals count
first contacts and signup targets once, with cumulative signups across months.
The program view also includes dated email drafts.

Targets use the program mix and funnel inputs. Timing uses the shared outreach
settings, including one to three emails, spacing, signup buffer, and preparation
lead times. Season-based signup deadlines precede the season; year-round programs
use their editable reach-out dates. Annual targets split across those campaigns.
Capacity calculations remain separate from acquisition execution targets.

Drafts do not send email. Replace the signup-link placeholder and review copy
before use. Navigation preserves in-page inputs; reloading restores defaults.
The old #prospecting link opens the execution section in By program view.
