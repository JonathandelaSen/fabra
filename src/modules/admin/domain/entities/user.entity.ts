import {
  AggregateRoot,
  Timestamp,
  UserId,
  type UserId as UserIdType,
} from "@/modules/shared";
import { UserEmail } from "../value-objects/user-email.value-object";

export interface UserPrimitives {
  id: string;
  email: string;
  createdAt: string;
}

export class User extends AggregateRoot {
  private constructor(
    private readonly userId: UserIdType,
    private readonly userEmail: UserEmail,
    private readonly userCreatedAt: Timestamp
  ) {
    super();
  }

  static fromPrimitives(primitives: UserPrimitives): User {
    return new User(
      UserId.fromPrimitives(primitives.id),
      UserEmail.fromPrimitives(primitives.email),
      Timestamp.fromPrimitives(primitives.createdAt)
    );
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.userId.toPrimitives(),
      email: this.userEmail.toPrimitives(),
      createdAt: this.userCreatedAt.toPrimitives(),
    };
  }

  get id(): string {
    return this.userId.toPrimitives();
  }

  get email(): string {
    return this.userEmail.toPrimitives();
  }
}
