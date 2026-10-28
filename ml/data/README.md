# Data

Keep raw medical images outside Git.

The training pipeline expects a manifest CSV:

```csv
path,label,group_id
data/images/example_xray.png,xray,group_001
data/images/example_photo.jpg,not_xray,photo_001
```

Accepted labels:

- `xray`
- `not_xray`

`group_id` should represent a patient, study, acquisition group, or another unit that must stay in one split.

Do not commit the actual dataset to GitHub.
