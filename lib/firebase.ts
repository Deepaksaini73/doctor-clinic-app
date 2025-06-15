import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  databaseURL: 'https://smart-clinic-system-cc152-default-rtdb.asia-southeast1.firebasedatabase.app/',
  // Add other Firebase config properties if needed
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 