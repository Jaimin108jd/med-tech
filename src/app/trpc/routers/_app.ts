
import { doctorRouter } from '@/modules/doctor/server/doctor-procedure';
import { createTRPCRouter } from '../init';
import { userRouter } from './user-router';
import { doctorType } from '@/modules/doctor/server/doctor-types-procedure';
import { patientRouter } from '@/modules/patient/server/patient-procdeure';
import { paymentRouter } from '@/modules/patient/server/payment-procedure';
import { chatRouter } from '@/modules/chat/server/chat-procedure';
import { videoCallRouter } from '@/modules/chat/server/video-call-procedure';

export const appRouter = createTRPCRouter({
  users: userRouter,
  doctorType: doctorType,
  doctor: doctorRouter,
  patient: patientRouter,
  payment: paymentRouter,
  chat: chatRouter,
  videoCall: videoCallRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;