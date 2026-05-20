import { UserRole } from '../../../../common/enums/roles.enum';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly fcmToken: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // ─── Domain logic ────────────────────────────────────────────────────────────

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isTeacher(): boolean {
    return this.role === UserRole.TEACHER;
  }

  isStudent(): boolean {
    return this.role === UserRole.STUDENT;
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  canManageClasses(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  toPublicProfile() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }

  // ─── Factory ─────────────────────────────────────────────────────────────────
  static create(props: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: UserRole;
    fcmToken?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): UserEntity {
    return new UserEntity(
      props.id,
      props.email,
      props.name,
      props.passwordHash,
      props.role,
      props.fcmToken ?? null,
      props.isActive ?? true,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }
}
