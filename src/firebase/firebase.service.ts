import { Injectable, Logger } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private static firebaseApp: firebaseAdmin.app.App;
  private logger: Logger;
  private serviceAccount: firebaseAdmin.ServiceAccount;
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(FirebaseService.name);
    const config = JSON.parse(
      this.configService.get<string>('FIREBASE_CREDENTIALS'),
    );
    if (!FirebaseService.firebaseApp) {
      FirebaseService.firebaseApp = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          (this.serviceAccount = config as firebaseAdmin.ServiceAccount),
        ),
      });
      this.logger.log('Firebase initialized successfully');
    }
  }

  getAuth(): firebaseAdmin.auth.Auth {
    return firebaseAdmin.auth();
  }

  getMessaging(): firebaseAdmin.messaging.Messaging {
    return firebaseAdmin.messaging();
  }

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    notification_data?: string,
  ): Promise<void> {
    try {
      const topic = `user_${userId}`;
      const payload: firebaseAdmin.messaging.Message = {
        topic,
        notification: {
          title,
          body: message,
        },
      };
      if (notification_data) payload.data = { notification_data };
      const response = await this.getMessaging().send(payload);
      this.logger.log(JSON.stringify(response));
    } catch (error) {
      this.logger.error('Error sending notification:', error);
    }
  }
  async subscribeUserToTopic(userId: string, fcmToken: string): Promise<void> {
    try {
      const topic = `user_${userId}`;
      const response = await this.getMessaging().subscribeToTopic(
        fcmToken,
        topic,
      );
      this.logger.log(JSON.stringify(response));
    } catch (error) {
      this.logger.error('Error subscribing user to topic:', error);
    }
  }
}
