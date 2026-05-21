export interface PrismaClientLike {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
}
