import React, { useState } from 'react';
import { Language, Reservation } from '../types';
import { translations } from '../data/translations';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  Download, 
  Sparkles, 
  Phone, 
  Mail, 
  User 
} from 'lucide-react';

interface ReservationSectionProps {
  language: Language;
  onReservationComplete: (res: Reservation) => void;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  language,
  onReservationComplete,
}) => {
  const t = translations[language].reservation;

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('20:00');
  const [guests, setGuests] = useState(2);
  const [seatingArea, setSeatingArea] = useState(t.salons[0]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const timeSlots = [
    '18:00', '18:30', '19:15', '20:00', '20:45', '21:30', '22:15', '23:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReservation: Reservation = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        code,
        date,
        time,
        guests,
        seatingArea,
        guestName: fullName,
        phone,
        email: email || undefined,
        notes: notes || undefined,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      setConfirmedReservation(newReservation);
      onReservationComplete(newReservation);
      setIsSubmitting(false);
    }, 600);
  };

  const handleDownloadIcs = () => {
    if (!confirmedReservation) return;

    const [year, month, day] = confirmedReservation.date.split('-');
    const [hours, mins] = confirmedReservation.time.split(':');
    const startIso = `${year}${month}${day}T${hours}${mins}00`;
    const endHours = String(Number(hours) + 2).padStart(2, '0');
    const endIso = `${year}${month}${day}T${endHours}${mins}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NOIR ROYALE//Luxury Dining Experience//EN',
      'BEGIN:VEVENT',
      `UID:${confirmedReservation.code}@noirroyale.com`,
      `DTSTAMP:${startIso}Z`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:Dinner at NOIR ROYALE (${confirmedReservation.seatingArea})`,
      `DESCRIPTION:Reservation Reference: ${confirmedReservation.code}\\nParty of ${confirmedReservation.guests}\\nGuest: ${confirmedReservation.guestName}`,
      'LOCATION:NOIR ROYALE Grand Salons & Imperial Vaults',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NoirRoyale-Reservation-${confirmedReservation.code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="reservations" className="relative py-28 bg-[#080808] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.kicker}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#F5F1E8] mb-4 tracking-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-[#F5F1E8]/70 leading-relaxed font-light">
            {t.subtitle}
          </p>
        </div>

        {confirmedReservation ? (
          /* Confirmation Card with Royal Gold Accents */
          <div className="bg-[#141414] border border-[#D4AF37]/50 rounded-sm p-8 sm:p-12 text-center shadow-2xl space-y-8 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">
                {t.bookingCode}
              </span>
              <span className="font-display text-4xl sm:text-5xl font-bold text-[#F5F1E8] tracking-widest tabular-nums">
                {confirmedReservation.code}
              </span>
            </div>

            <div className="max-w-md mx-auto space-y-2 text-sm text-[#F5F1E8]/80 py-4 border-y border-white/10 text-start">
              <p><strong className="text-white">{language === 'ar' ? 'الاسم:' : 'Guest:'}</strong> {confirmedReservation.guestName}</p>
              <p><strong className="text-white">{language === 'ar' ? 'الموعد:' : 'Date & Time:'}</strong> {confirmedReservation.date} · {confirmedReservation.time}</p>
              <p><strong className="text-white">{language === 'ar' ? 'عدد الضيوف:' : 'Party Size:'}</strong> {confirmedReservation.guests} {t.guestsSuffix}</p>
              <p><strong className="text-white">{language === 'ar' ? 'القاعة:' : 'Salon:'}</strong> {confirmedReservation.seatingArea}</p>
            </div>

            <p className="text-xs sm:text-sm text-[#F5F1E8]/60 font-light max-w-lg mx-auto">
              {t.successDesc}
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={handleDownloadIcs}
                className="flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-semibold bg-[#D4AF37] hover:bg-[#F2D98D] text-[#080808] rounded-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadCalendar}</span>
              </button>

              <button
                onClick={() => setConfirmedReservation(null)}
                className="px-6 py-3 text-xs uppercase tracking-widest font-medium border border-white/20 text-[#F5F1E8] hover:border-[#D4AF37] rounded-sm transition-all cursor-pointer"
              >
                {t.bookAnother}
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Reservation Form */
          <form 
            onSubmit={handleSubmit}
            className="bg-[#141414] border border-white/10 rounded-sm p-6 sm:p-10 shadow-2xl space-y-8"
          >
            {/* Step 1: Dining Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.dateLabel}</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#080808] border border-white/15 rounded-sm text-sm text-[#F5F1E8] focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.timeLabel}</span>
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080808] border border-white/15 rounded-sm text-sm text-[#F5F1E8] focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (Dinner Service)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Party Size & Seating Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>{t.guestsLabel}</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 6, 8, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuests(num)}
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-sm border transition-all cursor-pointer ${
                        guests === num
                          ? 'bg-[#D4AF37] text-[#080808] border-[#D4AF37]'
                          : 'bg-[#080808] text-[#F5F1E8]/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold block mb-2">
                  {t.salonLabel}
                </label>
                <select
                  value={seatingArea}
                  onChange={(e) => setSeatingArea(e.target.value)}
                  className="w-full px-4 py-3 bg-[#080808] border border-white/15 rounded-sm text-sm text-[#F5F1E8] focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
                >
                  {t.salons.map((salon, idx) => (
                    <option key={idx} value={salon}>
                      {salon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Distinguished Guest Info */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <span className="text-xs uppercase tracking-wider text-[#F5F1E8]/50 block font-medium">
                {language === 'ar' ? 'بيانات الضيف الكريم' : 'Distinguished Guest Information'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-[#F5F1E8]/40" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNameLabel}
                    className="w-full pl-9 pr-4 py-3 bg-[#080808] border border-white/15 rounded-sm text-sm text-[#F5F1E8] placeholder-[#F5F1E8]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-[#F5F1E8]/40" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phoneLabel}
                    className="w-full pl-9 pr-4 py-3 bg-[#080808] border border-white/15 rounded-sm text-sm text-[#F5F1E8] placeholder-[#F5F1E8]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-[#F5F1E8]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailLabel}
                  className="w-full pl-9 pr-4 py-3 bg-[#080808] border border-white/15 rounded-sm text-sm text-[#F5F1E8] placeholder-[#F5F1E8]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesLabel}
                  className="w-full px-4 py-3 bg-[#080808] border border-white/15 rounded-sm text-sm text-[#F5F1E8] placeholder-[#F5F1E8]/40 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#080808] bg-[#D4AF37] hover:bg-[#F2D98D] rounded-sm transition-all shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? t.submitting : t.submitButton}
            </button>
          </form>
        )}

      </div>
    </section>
  );
};
