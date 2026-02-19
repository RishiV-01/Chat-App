import mongoose from 'mongoose';

// =============================================================================
// POC: User schema (current)
// =============================================================================
const userSchema = new mongoose.Schema({
  ssoId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['broker', 'underwriter'], required: true },
  profilePicture: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: null },

  // =============================================================================
  // PRODUCTION: Add Cognito fields (uncomment when switching to Cognito auth)
  // =============================================================================
  // The `cognitoSub` is the unique identifier from AWS Cognito ('sub' claim in JWT).
  // This links the ChatApp user to their Cognito identity.
  //
  // cognitoSub: { type: String, unique: true, sparse: true },  // Cognito 'sub' claim
  // department: { type: String, default: null },                // From parent app
  // parentAppUserId: { type: String, default: null },           // Parent app's user ID for cross-referencing

}, { timestamps: true });

userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// =============================================================================
// PRODUCTION: Add index on cognitoSub for fast lookup during auth
// =============================================================================
// userSchema.index({ cognitoSub: 1 });

export default mongoose.model('User', userSchema);
