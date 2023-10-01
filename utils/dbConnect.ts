declare global {
  var mongoose: any // This must be a `var` and not a `let / const`
}

import mongoose from 'mongoose';
import movie from '../models/movie';
import user from '../models/user';
import restaurant from 'models/restaurant';



const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside environments'
  )
};

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function dbConnect() {
  // check if we have a connection to the database or if it's currently
  // connecting or disconnecting (readyState 1, 2 and 3)

  if (!mongoose.models?.User) {
    user.schema;
  }
  if (!mongoose.models?.Movie) {
    movie.schema;
  }
  if (!mongoose.models?.Restaurant) {
    restaurant.schema;
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error(e);
  }

  return cached.conn
}

export default dbConnect;
