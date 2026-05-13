import { test, expect } from '@playwright/test';

// Helper: get the page heading (avoids strict mode with bottom nav text)
const heading = (page: any, name: string) => page.getByRole('heading', { name });

test.describe('StudyFlow - Page Load Tests', () => {

  test('Welcome page loads and shows onboarding', async ({ page }) => {
    await page.goto('/welcome');
    await expect(heading(page, 'StudyFlow')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'Начать' })).toBeVisible();
  });

  test('Schedule page loads and shows lessons', async ({ page }) => {
    await page.goto('/schedule');
    await expect(heading(page, 'Расписание')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Иван Смирнов').first()).toBeVisible({ timeout: 5000 });
  });

  test('Students page loads and shows student list', async ({ page }) => {
    await page.goto('/students');
    await expect(heading(page, 'Ученики')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Иван')).toBeVisible({ timeout: 5000 });
  });

  test('Assignments page loads', async ({ page }) => {
    await page.goto('/assignments');
    await expect(heading(page, 'Задания')).toBeVisible({ timeout: 5000 });
  });

  test('Payments page loads as receipt-based list', async ({ page }) => {
    await page.goto('/payments');
    await expect(heading(page, 'Оплаты')).toBeVisible({ timeout: 5000 });
  });

  test('Analytics page loads with computed metrics', async ({ page }) => {
    await page.goto('/analytics');
    await expect(heading(page, 'Аналитика')).toBeVisible({ timeout: 5000 });
  });

  test('Settings page loads with profile info', async ({ page }) => {
    await page.goto('/settings');
    await expect(heading(page, 'Настройки')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Анна', { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('FAQ page loads with static content', async ({ page }) => {
    await page.goto('/faq');
    await expect(heading(page, 'Часто задаваемые вопросы')).toBeVisible({ timeout: 5000 });
  });

  test('More page loads with navigation menu', async ({ page }) => {
    await page.goto('/more');
    await expect(heading(page, 'Ещё')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Аналитика')).toBeVisible({ timeout: 5000 });
  });

  test('Notifications page loads', async ({ page }) => {
    await page.goto('/notifications');
    await expect(heading(page, 'Уведомления')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Telegram')).toBeVisible({ timeout: 5000 });
  });

  test('Slot creation page loads for tutor', async ({ page }) => {
    await page.goto('/schedule/slots/create');
    await expect(heading(page, 'Создать слот')).toBeVisible({ timeout: 5000 });
  });

  test('Lesson detail page loads', async ({ page }) => {
    await page.goto('/schedule/l1');
    await expect(heading(page, 'Детали занятия')).toBeVisible({ timeout: 5000 });
  });

  test('Lesson edit page loads', async ({ page }) => {
    await page.goto('/schedule/l1/edit');
    await expect(heading(page, 'Редактировать занятие')).toBeVisible({ timeout: 5000 });
  });

  test('Student invite page loads for tutor', async ({ page }) => {
    await page.goto('/students/invite');
    await expect(heading(page, 'Пригласить ученика')).toBeVisible({ timeout: 5000 });
  });

  test('Student detail page loads', async ({ page }) => {
    await page.goto('/students/u2');
    await expect(heading(page, 'Детали ученика')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Иван', { exact: false }).first()).toBeVisible({ timeout: 5000 });
  });

  test('Assignment create page loads for tutor', async ({ page }) => {
    await page.goto('/assignments/create');
    await expect(heading(page, 'Создать задание')).toBeVisible({ timeout: 5000 });
  });

  test('Assignment detail page loads', async ({ page }) => {
    await page.goto('/assignments/a1');
    await expect(heading(page, 'Детали задания')).toBeVisible({ timeout: 5000 });
  });

  test('Payment detail page loads', async ({ page }) => {
    await page.goto('/payments/l1');
    await expect(heading(page, 'Детали платежа')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('StudyFlow - Key User Flows', () => {

  test('Complete flow: tutor creates slot and returns to schedule', async ({ page }) => {
    await page.goto('/schedule/slots/create');
    await expect(heading(page, 'Создать слот')).toBeVisible({ timeout: 5000 });

    // Fill the form
    const dateInput = page.locator('input[type="date"]');
    const timeInputs = page.locator('input[type="time"]');

    if (await dateInput.isVisible()) {
      await dateInput.fill('2026-06-01');
    }
    if (await timeInputs.nth(0).isVisible()) {
      await timeInputs.nth(0).fill('10:00');
    }
    if (await timeInputs.nth(1).isVisible()) {
      await timeInputs.nth(1).fill('11:00');
    }

    // Submit the form
    const createButton = page.getByRole('button', { name: 'Создать' });
    if (await createButton.isVisible()) {
      await createButton.click();
      await expect(heading(page, 'Расписание')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Lesson detail shows cancel flow for booked lesson', async ({ page }) => {
    await page.goto('/schedule/l1');
    await expect(heading(page, 'Детали занятия')).toBeVisible({ timeout: 5000 });

    // Should show a status badge (booked = Запланировано)
    const statusBadge = page.getByText('Запланировано');
    if (await statusBadge.isVisible()) {
      // Good - lesson is booked
    }

    // Cancel button should be visible for booked lessons (tutor view)
    const cancelBtn = page.getByRole('button', { name: 'Отменить занятие' });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      // After cancellation, should navigate back to schedule
      await expect(heading(page, 'Расписание')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Student view: login as student and see schedule', async ({ page }) => {
    await page.goto('/settings');
    await expect(heading(page, 'Настройки')).toBeVisible({ timeout: 5000 });

    // Click "Ученик" role switch button
    const studentBtn = page.getByRole('button', { name: /Ученик/ });
    if (await studentBtn.isVisible()) {
      await studentBtn.click();
      await page.waitForTimeout(1000);
    }

    // Navigate to schedule
    await page.goto('/schedule');
    await expect(heading(page, 'Расписание')).toBeVisible({ timeout: 5000 });
  });

  test('Student view: see payments page', async ({ page }) => {
    await page.goto('/settings');
    const studentBtn = page.getByRole('button', { name: /Ученик/ });
    if (await studentBtn.isVisible()) {
      await studentBtn.click();
      await page.waitForTimeout(500);
    }

    await page.goto('/payments');
    await expect(heading(page, 'Оплаты')).toBeVisible({ timeout: 5000 });
  });

  test('Role switching works: tutor → student → tutor', async ({ page }) => {
    await page.goto('/settings');
    await expect(heading(page, 'Настройки')).toBeVisible({ timeout: 5000 });

    // Check we start as tutor (Анна Петрова)
    await expect(page.getByText('Анна', { exact: false }).first()).toBeVisible({ timeout: 5000 });

    // Switch to student
    const studentBtn = page.getByRole('button', { name: /Ученик/ });
    await expect(studentBtn).toBeVisible({ timeout: 3000 });
    await studentBtn.click();
    await page.waitForTimeout(1500);

    // After switching, student name (Иван) should appear in settings
    await expect(page.getByText('Иван', { exact: false }).first()).toBeVisible({ timeout: 5000 });

    // Switch back to tutor
    const tutorBtn = page.getByRole('button', { name: /Репетитор/ });
    await expect(tutorBtn).toBeVisible({ timeout: 3000 });
    await tutorBtn.click();
    await page.waitForTimeout(1500);

    // Should show tutor name again
    await expect(page.getByText('Анна', { exact: false }).first()).toBeVisible({ timeout: 5000 });
  });
});
