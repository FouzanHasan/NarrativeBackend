import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { ProfileResponse } from '../types/dto';
import { UpdateProfileInput } from '../validators/profileValidators';

// studyGoal/motivationalGoal live directly on the User document (see
// models/User.ts) — there is no separate Profile model.

export async function getProfile(userId: string): Promise<ProfileResponse> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return {
    firstName: user.firstName,
    studyGoal: user.studyGoal,
    motivationalGoal: user.motivationalGoal,
  };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<ProfileResponse> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (input.firstName !== undefined) user.firstName = input.firstName;
  if (input.studyGoal !== undefined) user.studyGoal = input.studyGoal;
  if (input.motivationalGoal !== undefined) user.motivationalGoal = input.motivationalGoal;

  await user.save();

  return {
    firstName: user.firstName,
    studyGoal: user.studyGoal,
    motivationalGoal: user.motivationalGoal,
  };
}
