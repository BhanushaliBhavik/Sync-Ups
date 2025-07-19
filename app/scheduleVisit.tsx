import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Calendar Day Component
const CalendarDay = ({ 
  day, 
  isSelected = false, 
  isDisabled = false, 
  isOtherMonth = false,
  onPress 
}: {
  day: number;
  isSelected?: boolean;
  isDisabled?: boolean;
  isOtherMonth?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[
      styles.calendarDay, 
      isSelected && styles.selectedDay,
      isDisabled && styles.disabledDay
    ]} 
    onPress={onPress}
    disabled={isDisabled}
  >
    <Text style={[
      styles.dayText,
      isSelected && styles.selectedDayText,
      isDisabled && styles.disabledDayText,
      isOtherMonth && styles.otherMonthDayText
    ]}>
      {day}
    </Text>
  </TouchableOpacity>
);

// Time Slot Component
const TimeSlot = ({ 
  time, 
  isSelected = false, 
  isDisabled = false,
  onPress 
}: {
  time: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[
      styles.timeSlot, 
      isSelected && styles.selectedTimeSlot,
      isDisabled && styles.disabledTimeSlot
    ]} 
    onPress={onPress}
    disabled={isDisabled}
  >
    <Text style={[
      styles.timeText,
      isSelected && styles.selectedTimeText,
      isDisabled && styles.disabledTimeText
    ]}>
      {time}
    </Text>
  </TouchableOpacity>
);

// Visit Type Option Component
const VisitTypeOption = ({ 
  title, 
  subtitle, 
  isSelected = false,
  onPress 
}: {
  title: string;
  subtitle: string;
  isSelected?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.visitTypeCard, isSelected && styles.selectedVisitTypeCard]} 
    onPress={onPress}
  >
    <View style={styles.visitTypeContent}>
      <View style={styles.radioButton}>
        {isSelected && <View style={styles.radioButtonSelected} />}
      </View>
      <View style={styles.visitTypeText}>
        <Text style={styles.visitTypeTitle}>{title}</Text>
        <Text style={styles.visitTypeSubtitle}>{subtitle}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ScheduleVisitScreen() {
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTime, setSelectedTime] = useState('2:00 PM');
  const [visitType, setVisitType] = useState('in-person');
  const [notes, setNotes] = useState('');

  const currentMonth = 'January 2025';
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Calendar data for January 2025
  const calendarDays = [
    // Previous month days
    { day: 29, isOtherMonth: true }, { day: 30, isOtherMonth: true }, { day: 31, isOtherMonth: true },
    // Current month days
    { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }, { day: 7 },
    { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 },
    { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20 }, { day: 21 },
    { day: 22 }, { day: 23 }, { day: 24 }, { day: 25, isDisabled: true }, { day: 26 }, { day: 27 },
    { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }
  ];

  const timeSlots = [
    { time: '9:00 AM', isDisabled: false },
    { time: '10:00 AM', isDisabled: false },
    { time: '11:00 AM', isDisabled: false },
    { time: '1:00 PM', isDisabled: false },
    { time: '2:00 PM', isDisabled: false },
    { time: '3:00 PM', isDisabled: false },
    { time: '4:00 PM', isDisabled: false },
    { time: '5:00 PM', isDisabled: false },
    { time: '6:00 PM', isDisabled: true }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Property Information Section */}
        <View style={styles.propertyCard}>
          <View style={styles.propertyImage}>
            <Text style={styles.propertyImageText}>Property</Text>
          </View>
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyTitle}>Modern Downtown Apartment</Text>
            <Text style={styles.propertyLocation}>123 Main Street, Downtown</Text>
            <Text style={styles.propertyPrice}>$2,500/month</Text>
          </View>
        </View>

        {/* Select Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          
          {/* Calendar Navigation */}
          <View style={styles.calendarNav}>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{currentMonth}</Text>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>
            {/* Week Days Header */}
            <View style={styles.weekDays}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.weekDay}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Days */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((dayData, index) => (
                <CalendarDay
                  key={index}
                  day={dayData.day}
                  isSelected={selectedDate === dayData.day}
                  isDisabled={dayData.isDisabled}
                  isOtherMonth={dayData.isOtherMonth}
                  onPress={() => !dayData.isDisabled && setSelectedDate(dayData.day)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Select Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => (
              <TimeSlot
                key={index}
                time={slot.time}
                isSelected={selectedTime === slot.time}
                isDisabled={slot.isDisabled}
                onPress={() => !slot.isDisabled && setSelectedTime(slot.time)}
              />
            ))}
          </View>
        </View>

        {/* Visit Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Type</Text>
          <VisitTypeOption
            title="In-Person Visit"
            subtitle="Meet at the property"
            isSelected={visitType === 'in-person'}
            onPress={() => setVisitType('in-person')}
          />
          <VisitTypeOption
            title="Virtual Tour"
            subtitle="Video call walkthrough"
            isSelected={visitType === 'virtual'}
            onPress={() => setVisitType('virtual')}
          />
        </View>

        {/* Additional Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Any specific requirements or questions..."
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.resizeHandle}>
              <View style={styles.resizeLine} />
              <View style={styles.resizeLine} />
            </View>
          </View>
        </View>

        {/* Schedule Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.scheduleButton}>
            <Text style={styles.scheduleButtonText}>Schedule Visit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  propertyImage: {
    width: 60,
    height: 60,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  propertyImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  propertyDetails: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  calendar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    color: '#111827',
  },
  selectedDay: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledDay: {
    opacity: 0.5,
  },
  disabledDayText: {
    color: '#9CA3AF',
  },
  otherMonthDayText: {
    color: '#D1D5DB',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: '30%',
  },
  timeText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedTimeSlot: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  selectedTimeText: {
    color: '#FFFFFF',
  },
  disabledTimeSlot: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  disabledTimeText: {
    color: '#9CA3AF',
  },
  visitTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedVisitTypeCard: {
    borderColor: '#EF4444',
  },
  visitTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  visitTypeText: {
    flex: 1,
  },
  visitTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  visitTypeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  notesContainer: {
    position: 'relative',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 2,
  },
  resizeLine: {
    width: 2,
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  scheduleButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
