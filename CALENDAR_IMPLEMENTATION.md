# Appointment Calendar Implementation Guide

## Overview

This document outlines the complete implementation of an interactive appointment calendar for medical service providers (doctors, nurses, labs) in the Tiba Cloud medical platform. The calendar provides a comprehensive view of scheduled appointments with filtering capabilities, detailed appointment information, and support for both virtual and in-person consultations. The implementation includes occupied time slots visualization to prevent double-booking.

## Features Implemented

### 🗓️ Interactive Calendar View
- **Monthly Grid Layout**: Visual calendar with clickable dates
- **Appointment Indicators**: Color-coded badges showing appointment types
- **Date Navigation**: Previous/next month navigation
- **Current Date Highlighting**: Today's date is prominently highlighted
- **Appointment Count**: Visual indicators for dates with multiple appointments

### 📋 List View
- **Chronological Listing**: Appointments sorted by date and time
- **Detailed Information**: Patient names, appointment types, and times
- **Click-to-View**: Click any appointment for detailed information

### 🔍 Smart Filtering
- **Today**: Show only today's appointments
- **Tomorrow**: Show only tomorrow's appointments
- **Next Week**: Show appointments for the next 7 days
- **Next Month**: Show appointments for the next 30 days
- **All Appointments**: Show all scheduled appointments

### 📱 Appointment Details Modal
- **Patient Information**: Name, contact details
- **Appointment Details**: Date, time, type, status
- **Medical Information**: Reason for visit, symptoms
- **Action Buttons**: Start video call or view location
- **Payment Status**: Visual indication of payment status

### 🎨 Visual Design
- **Color Coding**: Green for virtual appointments, orange for in-person
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: ARIA labels and keyboard navigation support
- **Smooth Animations**: Hover effects and transitions

## File Structure

```
TibaCloud/Frontend/src/
├── components/
│   └── calendar/
│       ├── AppointmentCalendar.tsx    # Main calendar component
│       ├── CalendarDemo.tsx           # Demo component with sample data
│       ├── index.ts                   # Export declarations
│       └── README.md                  # Component documentation
├── hooks/
│   └── useNursingCalendar.ts          # Custom hook for nursing calendar
├── services/
│   ├── appointmentService.ts          # Updated API service
│   └── nursingService.ts              # Nursing service with accept/reject
└── pages/
    └── ProviderDashboard/
        ├── DoctorDashboard.tsx        # Updated dashboard with calendar
        ├── HomeNursingDashboard.tsx   # Nursing dashboard with calendar
        └── LabDashboard.tsx           # Lab dashboard ready for calendar
```

## Database Schema

The implementation works with the following appointment table structure:

```sql
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show') DEFAULT 'scheduled',
    type ENUM('in_person', 'virtual') DEFAULT 'in_person',
    reason_for_visit TEXT,
    symptoms TEXT,
    doctor_notes TEXT,
    prescription TEXT,
    meeting_link VARCHAR(255),
    fee DECIMAL(10,2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_appointment_datetime (appointment_datetime),
    INDEX idx_status (status),
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
```

## API Integration

### Updated Appointment Service

The appointment service has been updated to work with the new database schema:

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
  meeting_link?: string;
  fee: number;
  is_paid: boolean;
  patient?: {
    user: {
      name: string;
      email: string;
      phone_number: string;
    };
  };
}
```

### API Endpoints

#### Doctor Appointments
- `GET /doctor/appointments` - Fetch doctor's appointments
- `GET /appointments/{id}` - Get specific appointment details
- `POST /appointments` - Create new appointment
- `PUT /appointments/{id}` - Update appointment
- `PUT /appointments/{id}/cancel` - Cancel appointment
- `GET /doctors/{id}/occupied-dates` - Get occupied dates for doctor
- `GET /doctors/{id}/occupied-times` - Get occupied times for doctor on specific date

#### Nursing Services
- `GET /nursing-provider/nursing-services` - Fetch nursing provider's services
- `PUT /nursing-services/{id}/accept` - Accept nursing service request
- `PUT /nursing-services/{id}/confirm` - Confirm nursing service request
- `PUT /nursing-services/{id}/reject` - Reject nursing service request
- `GET /nursing-providers/{id}/occupied-dates` - Get occupied dates for nursing provider
- `GET /nursing-providers/{id}/occupied-times` - Get occupied times for nursing provider

#### Lab Tests
- `GET /lab-provider/lab-tests` - Fetch lab provider's tests
- `GET /lab-providers/{id}/occupied-dates` - Get occupied dates for lab provider
- `GET /lab-providers/{id}/occupied-times` - Get occupied times for lab provider

## Integration Steps

### 1. Backend Setup

Ensure your Laravel backend has the updated appointment migration and model:

```bash
php artisan migrate
```

The backend now includes:
- Accept/reject endpoints for nursing services
- Occupied dates/times endpoints for all provider types
- Calendar functionality for doctors, nursing providers, and lab providers

### 2. Frontend Dependencies

All required dependencies are already installed:
- `date-fns` for date manipulation
- `@radix-ui/*` components for UI
- `lucide-react` for icons

### 3. Import and Use

#### For Doctor Dashboard
```tsx
import { AppointmentCalendar } from '@/components/calendar';

function DoctorSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    appointmentService.getAppointments('doctor')
      .then(setAppointments)
      .catch(console.error);
  }, []);

  return (
    <AppointmentCalendar
      appointments={appointments}
      onAppointmentClick={(appointment) => {
        console.log('Selected:', appointment);
      }}
    />
  );
}
```

#### For Nursing Provider Dashboard
```tsx
import { AppointmentCalendar } from '@/components/calendar';
import useNursingCalendar from '@/hooks/useNursingCalendar';

function NursingSchedule() {
  const {
    appointments,
    isLoading,
    acceptRequest,
    rejectRequest,
  } = useNursingCalendar();

  return (
    <AppointmentCalendar
      appointments={appointments}
      onAppointmentConfirm={acceptRequest}
      onAppointmentReject={rejectRequest}
    />
  );
}
```

## Usage in Provider Dashboards

The calendar is integrated into multiple provider dashboards:

### Doctor Dashboard
- Route: `http://localhost:8080/provider/doctor`
- Tab: "My Schedule"
- Features: View appointments, appointment details modal, virtual meeting links

### Nursing Provider Dashboard
- Route: `http://localhost:8080/provider/nursing`
- Tab: "My Schedule"
- Features: Accept/reject requests, view occupied slots, prevent double-booking

### Lab Provider Dashboard
- Route: `http://localhost:8080/provider/lab`
- Ready for calendar integration with occupied slots functionality

### Common Implementation Features
1. **Loading State**: Shows spinner while fetching appointments
2. **Error Handling**: Graceful handling of API failures
3. **Click Handlers**: Toast notifications and custom appointment handling
4. **Responsive Layout**: Adapts to different screen sizes
5. **Occupied Slots**: Visual indication of unavailable time slots
6. **Double-booking Prevention**: Prevents scheduling conflicts

## Customization Options

### Color Themes
Modify appointment colors by updating the `getAppointmentModeColor` function:

```typescript
const getAppointmentModeColor = (appointment: Appointment) => {
  const isVirtual = appointment.type === "virtual";
  return isVirtual
    ? "bg-blue-100 text-blue-800"    // Custom virtual color
    : "bg-red-100 text-red-800";     // Custom in-person color
};
```

### Additional Filters
Add custom filters by extending the `FilterType` union:

```typescript
type FilterType = "all" | "today" | "tomorrow" | "week" | "month" | "unpaid" | "pending" | "confirmed";
```

### Provider-Specific Customization
Different providers can customize the calendar for their specific needs:

```typescript
// Nursing provider specific
const nursingCalendarProps = {
  showAcceptReject: true,
  allowStatusChange: true,
  preventDoubleBooking: true,
};

// Lab provider specific
const labCalendarProps = {
  showTestDetails: true,
  allowRescheduling: true,
  showTurnaroundTime: true,
};
```

### Calendar View Options
- Modify `min-h-[100px]` to adjust calendar cell height
- Change grid layout for different calendar sizes
- Add week view or agenda view options

## Performance Considerations

### Optimizations Implemented
- **Efficient Date Filtering**: Uses date-fns utilities for fast date comparisons
- **Memoized Calculations**: Prevents unnecessary recalculations
- **Conditional Rendering**: Only renders visible appointments
- **Lazy Loading**: Modal content loaded on demand
- **Custom Hooks**: useNursingCalendar hook for nursing-specific functionality
- **Smart Caching**: Occupied times cached per date to reduce API calls

### Recommended Practices
- Implement pagination for large appointment lists
- Cache appointment data with react-query or SWR
- Use virtual scrolling for very long lists
- Debounce filter changes
- Implement real-time updates with WebSockets for instant calendar updates
- Add offline support with service workers

## Testing

### Manual Testing Checklist

#### Core Calendar Functionality
- [ ] Calendar displays correctly with sample data
- [ ] Clicking dates shows appointments for that day
- [ ] Filtering works for all time periods
- [ ] Appointment details modal opens and displays correctly
- [ ] Both calendar and list views function properly
- [ ] Virtual vs in-person appointments display differently
- [ ] Mobile responsiveness works correctly

#### Provider-Specific Testing
- [ ] Nursing providers can accept/reject requests
- [ ] Occupied time slots are visually indicated
- [ ] Double-booking prevention works correctly
- [ ] Request status updates reflect in real-time
- [ ] Calendar updates after accepting/rejecting requests
- [ ] Lab providers can view test schedules
- [ ] Occupied dates API returns correct data

### Demo Components
Use demo components to test all features:

```tsx
// General calendar demo
import CalendarDemo from '@/components/calendar/CalendarDemo';

// Nursing-specific testing
import useNursingCalendar from '@/hooks/useNursingCalendar';

function TestPage() {
  return <CalendarDemo />;
}

function NursingCalendarTest() {
  const calendar = useNursingCalendar();
  return (
    <div>
      <h2>Nursing Calendar Test</h2>
      <AppointmentCalendar {...calendar} />
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Appointments Not Showing**
   - Check API endpoint is returning data in correct format
   - Verify appointment_datetime field is properly formatted
   - Ensure patient relationship is included in API response

2. **Date Display Issues**
   - Confirm timezone handling in date conversions
   - Check date-fns locale settings
   - Verify ISO datetime string format

3. **Modal Not Opening**
   - Check Dialog component imports
   - Verify state management for modal visibility
   - Ensure appointment data is properly passed

4. **Accept/Reject Not Working**
   - Verify nursing service API endpoints are working
   - Check authentication and provider permissions
   - Ensure request IDs are being passed correctly

5. **Occupied Slots Not Showing**
   - Check occupied dates/times API endpoints
   - Verify provider ID is correct
   - Ensure calendar hook is loading occupied data

6. **Styling Issues**
   - Confirm Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify component hierarchy for proper styling

## Future Enhancements

### Planned Features
- **Drag & Drop Rescheduling**: Allow providers to drag appointments to new times
- **Recurring Appointments**: Support for repeating appointments
- **Advanced Time Slot Management**: Visual time slot availability with conflicts
- **Calendar Export**: Export to Google Calendar, Outlook, etc.
- **Real-time Updates**: WebSocket integration for live updates
- **Notification System**: Appointment reminders and alerts
- **Multi-provider View**: View multiple providers' schedules simultaneously
- **Resource Management**: Room and equipment booking integration

### Integration Opportunities
- **Video Call Integration**: Direct integration with Zoom, Teams, etc.
- **SMS Notifications**: Automated patient reminders
- **Payment Processing**: Direct payment links in appointment details
- **Electronic Health Records**: Integration with patient medical records
- **Lab Information System**: Integration with lab equipment and results
- **Nursing Care Plans**: Integration with patient care documentation
- **Mobile Apps**: React Native or PWA for mobile calendar access

## Security Considerations

- All appointment data is filtered by provider_id on the backend
- Patient information is only accessible to assigned providers
- Meeting links are protected and expire appropriately
- HIPAA compliance for patient data handling
- Accept/reject actions are authenticated and authorized
- Occupied slots data is provider-specific and secured
- API rate limiting prevents abuse of calendar endpoints

## Deployment Notes

1. Ensure all environment variables are set for API endpoints
2. Configure CORS settings for calendar API calls
3. Set up proper error logging for appointment-related issues
4. Test calendar functionality in production environment
5. Monitor API performance for appointment queries

## Support

For technical issues or questions about the calendar implementation:
1. Check the component documentation in `/components/calendar/README.md`
2. Review the demo component for usage examples
3. Verify API integration with appointment service
4. Test with sample data using CalendarDemo component

---

**Implementation Status**: ✅ Complete (Doctor, Nursing) / 🚧 Ready (Lab)
**Last Updated**: January 2025
**Version**: 1.1.0

### Recent Updates (v1.1.0)
- ✅ Added nursing provider calendar functionality
- ✅ Implemented accept/reject request handlers
- ✅ Added occupied time slots visualization
- ✅ Created useNursingCalendar custom hook
- ✅ Added double-booking prevention
- ✅ Extended API with nursing service endpoints
- 🚧 Lab provider calendar integration ready
- 🚧 Multi-provider dashboard views planned