import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserModel, UserDocument } from '../../../auth/infrastructure/schemas/user.schema';

export enum NotificationType {
  REMINDER = 'reminder',
  CANCELLATION = 'cancellation',
  CHANGE = 'change',
  GENERAL = 'general',
}

export interface SendNotificationDto {
  userIds: string[];
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseInitialized = false;

  constructor(
    private readonly config: ConfigService,
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  onModuleInit() {
    try {
      const projectId = this.config.get('FIREBASE_PROJECT_ID');
      if (!projectId) {
        this.logger.warn('Firebase no configurado (push notifications deshabilitadas)');
        return;
      }
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
            privateKey: this.config
              .get<string>('FIREBASE_PRIVATE_KEY')
              ?.replace(/\\n/g, '\n'),
          }),
        });
        this.firebaseInitialized = true;
        this.logger.log('Firebase Admin inicializado ✅');
      }
    } catch (err) {
      this.logger.warn('Firebase no configurado (push notifications deshabilitadas)');
    }
  }

  async sendToUsers(dto: SendNotificationDto): Promise<{ sent: number; failed: number }> {
    if (!this.firebaseInitialized) {
      this.logger.warn('Firebase no inicializado, notificación omitida');
      return { sent: 0, failed: 0 };
    }

    const users = await this.userModel
      .find({
        _id: { $in: dto.userIds.map((id) => new Types.ObjectId(id)) },
        fcmToken: { $ne: null },
        isActive: true,
      })
      .select('fcmToken')
      .exec();

    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    if (!tokens.length) return { sent: 0, failed: 0 };

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title: dto.title, body: dto.body },
        data: { type: dto.type, ...dto.data },
        android: {
          priority: 'high',
          notification: { channelId: 'scheduler-channel', sound: 'default' },
        },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
      return { sent: response.successCount, failed: response.failureCount };
    } catch (err) {
      this.logger.error('Error enviando push notifications:', err);
      return { sent: 0, failed: tokens.length };
    }
  }

  async notifyClassCancellation(classTitle: string, reason: string, studentIds: string[]) {
    return this.sendToUsers({
      userIds: studentIds,
      title: `❌ Clase cancelada: ${classTitle}`,
      body: `Motivo: ${reason}`,
      type: NotificationType.CANCELLATION,
    });
  }

  async sendClassReminder(classTitle: string, startTime: string, studentIds: string[]) {
    return this.sendToUsers({
      userIds: studentIds,
      title: `⏰ Recordatorio: ${classTitle}`,
      body: `Tu clase comienza a las ${startTime}`,
      type: NotificationType.REMINDER,
    });
  }
}
