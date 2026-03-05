## Packages
use-debounce | For debouncing the autosave in the resume editor
uuid | For generating unique IDs for experience/education array items
@types/uuid | Type definitions for uuid
lucide-react | Icons
date-fns | Date formatting
framer-motion | Page transitions and UI animations

## Notes
Backend has an implicit endpoint `GET /api/resumes/:id/export/pdf` for PDF generation, which will be opened in a new tab.
The frontend uses standard React Hook Form with `useFieldArray` for dynamic lists (experience, education).
