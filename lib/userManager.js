import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'food_logger_user_id';

export function getUserId() {
  if (typeof window === 'undefined') return null;
  
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

export function clearUserId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_ID_KEY);
}

export function isNewDay() {
  if (typeof window === 'undefined') return false;
  
  const lastDate = localStorage.getItem('food_logger_last_date');
  const today = new Date().toISOString().slice(0, 10);
  
  if (lastDate !== today) {
    localStorage.setItem('food_logger_last_date', today);
    return true;
  }
  
  return false;
} 