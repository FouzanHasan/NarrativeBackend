import bcrypt from 'bcryptjs';
import { User, UserDocument } from '../models/User';
import { UserSettings } from '../models/UserSettings';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';
import { PublicUser } from '../types/dto';
import { RegisterInput, LoginInput } from '../validators/authValidators';

const SALT_ROUNDS = 10;

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
  };
}

export async function register(
  input: RegisterInput
): Promise<{ token: string; user: PublicUser }> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
  });

  // Every user owns exactly one UserSettings document (1:1) — create it
  // eagerly at registration so /settings and /apps never need upsert logic.
  await UserSettings.create({ userId: user._id });

  const token = signToken(user._id.toString());
  return { token, user: toPublicUser(user) };
}

export async function login(input: LoginInput): Promise<{ token: string; user: PublicUser }> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(user._id.toString());
  return { token, user: toPublicUser(user) };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return toPublicUser(user);
}
