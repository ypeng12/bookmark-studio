
export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class DatabaseFailure extends Failure {}
export class FileStorageFailure extends Failure {}
export class GeminiApiFailure extends Failure {
  constructor(message: string, public readonly code?: number) {
    super(message);
  }
}
export class NetworkFailure extends Failure {}
export class ValidationFailure extends Failure {}
export class PermissionFailure extends Failure {}
