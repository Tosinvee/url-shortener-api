// import { Processor, WorkerHost } from '@nestjs/bullmq';
// import { Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { environment } from 'src/environments/environment';
// import { Notification } from './notification.schema';
// import { Model } from 'mongoose';
// import { FirebaseService } from 'src/firebase/firebase.service';

// const { NOTIFICATION } = environment.queues;

// @Processor(NOTIFICATION)
// export class NotificationProcessor extends WorkerHost {
//   private logger: Logger;
//   constructor(
//     @InjectModel(Notification.name)
//     private readonly notificationModel: Model<Notification>,
//     private firebaseService: FirebaseService,
//   ) {
//     super();
//     this.logger = new Logger(NotificationProcessor.name);
//   }

//   async process(job: any) {
//     this.logger.log(
//       `Processing notification job ${job.id} for user ${job.data.userId}`,
//     );
//     const { userId, title, message, meta } = job.data;
//     try {
//       await this.firebaseService.sendNotification(
//         userId,
//         title,
//         message,
//         JSON.stringify(meta),
//       );
//       const notification = new this.notificationModel({
//         userId,
//         title,
//         message,
//         meta,
//       });
//       await notification.save();
//       this.logger.log(
//         `Notification sent successfully to user ${userId} (job: ${job.id})`,
//       );
//     } catch (error) {
//       this.logger.error(`Error processing notification job ${job.id}:`, error);
//     }
//   }
// }
