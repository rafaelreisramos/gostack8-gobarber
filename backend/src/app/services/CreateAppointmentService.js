import { format, isBefore, parseISO, startOfHour } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Appointment from '../models/Appointment';
import User from '../models/User';

import Notification from '../schemas/Notification';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    /*
     * Check if provider_is is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      throw new Error('You can only create appointments with providers.');
    }

    /**
     * Avoid user to make an appointment with himself
     */
    if (user_id === provider_id) {
      throw new Error('You cannot make an appointment with yourself.');
    }

    /**
     * Check appointment for past date
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error('Past dates are nor permitted.');
    }

    /**
     * Check appointment availability
     */
    const hasAppointment = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (hasAppointment) {
      throw new Error('Appointment date is not available.');
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    /**
     * Notify provider
     */
    const user = await User.findByPk(user_id);
    const formattedDate = format(hourStart, "dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}.`,
      user: provider_id,
    });

    return appointment;
  }
}

export default new CreateAppointmentService();
