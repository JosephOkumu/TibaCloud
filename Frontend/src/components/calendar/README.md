# Appointment Calendar Component

A comprehensive calendar component for doctors to view and manage their appointments with filtering capabilities and detailed appointment information.

## Features

- **Interactive Calendar View**: Monthly calendar with clickable dates showing appointment indicators
- **List View**: Alternative view showing appointments in a list format
- **Smart Filtering**: Filter appointments by today, tomorrow, next week, or next month
- **Appointment Details Modal**: Click on appointments to view detailed information
- **Visual Indicators**: 
  - Color-coded appointment types (green for virtual, orange for in-person)
  - Date highlighting for current day and selected dates
  - Appointment count indicators on dates with bookings
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Usage

```tsx
import { AppointmentCalendar } from '@/components/calendar';
import { Appointment } from '@/services/appointmentService';

function DoctorSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  return (
    <AppointmentCalendar
      appointments={appointments}
      onAppointmentClick={(appointment) => {
        console.log('Selected appointment:', appointment);
      }}
    />
  );
}
```

## Props

### `AppointmentCalendarProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `appointments` | `Appointment[]` | Yes | Array of appointments to display |
| `onAppointmentClick` | `(appointment: Appointment) => void` | No | Callback when an appointment is clicked |

## Appointment Data Structure

The component expects appointments to follow this structure:

```typescript
interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_datetime: string; // ISO datetime string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
  type: "in_person" | "virtual";
  reason_for_visit?: string;
  symptoms?: string;
  doctor_notes?: string;
  prescription?: string;
  meeting_link?: string; // For virtual appointments
  fee: number;
  is_paid: boolean;
  patient?: {
    id: number;
    user_id: number;
    user: {
      name: string;
      email: string;
      phone_number: string;
    };
  };
}
```

## Views

### Calendar View
- Monthly grid layout
- Appointments shown as colored badges on dates
- Click dates to see appointments for that day
- Navigate between months using arrow buttons

### List View
- Linear list of appointments
- Sorted chronologically
- Shows full appointment details
- Filterable by time periods

## Filtering Options

- **All Appointments**: Show all appointments
- **Today**: Only today's appointments
- **Tomorrow**: Only tomorrow's appointments
- **Next Week**: Appointments in the next 7 days
- **Next Month**: Appointments in the next 30 days

## Appointment Types

### Virtual Appointments
- Displayed with green background and video icon
- Shows "Video Call" badge
- Start Call button in details modal

### In-Person Appointments
- Displayed with orange background and location icon
- Shows "Physical Visit" badge
- View Location button in details modal

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Colors**: Blue for selected states, green for virtual appointments, orange for in-person
- **Typography**: Standard text sizes with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle shadows for depth and interaction feedback

## Dependencies

- React 18+
- date-fns for date manipulation
- Lucide React for icons
- Radix UI components (Dialog, Select, etc.)
- Tailwind CSS for styling

## Backend Integration

The component works with the appointments API endpoint:

```typescript
// Get doctor's appointments
const appointments = await appointmentService.getAppointments('doctor');
```

Make sure your backend provides appointments in the expected format with proper patient relationship data.

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- High contrast colors for visibility
- Focus indicators for interactive elements

## Customization

You can customize the appearance by:

1. Modifying the color classes in the component
2. Adjusting the calendar grid sizing
3. Changing the appointment badge styling
4. Customizing the modal layout

## Performance

- Efficiently filters appointments using date-fns utilities
- Minimal re-renders with proper React hooks usage
- Lazy loading of appointment details
- Optimized date calculations

## Error Handling

The component gracefully handles:
- Missing appointment data
- Invalid date formats
- Network errors (when integrated with API)
- Empty states

## Future Enhancements

Potential improvements:
- Drag and drop rescheduling
- Recurring appointment support
- Time slot availability view
- Integration with calendar applications
- Push notifications for upcoming appointments