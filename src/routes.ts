import { createBrowserRouter, redirect } from 'react-router';
import { Schedule } from './pages/Schedule';
import { SlotCreate } from './pages/SlotCreate';
import { LessonDetail } from './pages/LessonDetail';
import { LessonEdit } from './pages/LessonEdit';
import { Students } from './pages/Students';
import { StudentDetail } from './pages/StudentDetail';
import { StudentInvite } from './pages/StudentInvite';
import { StudentEdit } from './pages/StudentEdit';
import { Assignments } from './pages/Assignments';
import { AssignmentCreate } from './pages/AssignmentCreate';
import { AssignmentDetail } from './pages/AssignmentDetail';
import { Payments } from './pages/Payments';
import { PaymentDetail } from './pages/PaymentDetail';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { FAQ } from './pages/FAQ';
import { More } from './pages/More';
import { Notifications } from './pages/Notifications';
import { Welcome } from './pages/Welcome';

export const router = createBrowserRouter([
  {
    path: '/',
    loader: () => {
      if (typeof window !== 'undefined' && localStorage.getItem('onboarding_complete') === 'true') {
        return redirect('/schedule');
      }
      return redirect('/welcome');
    },
  },
  {
    path: '/welcome',
    Component: Welcome,
  },
  {
    path: '/schedule',
    Component: Schedule,
  },
  {
    path: '/schedule/slots/create',
    Component: SlotCreate,
  },
  {
    path: '/schedule/:id',
    Component: LessonDetail,
  },
  {
    path: '/schedule/:id/edit',
    Component: LessonEdit,
  },
  {
    path: '/students',
    Component: Students,
  },
  {
    path: '/students/invite',
    Component: StudentInvite,
  },
  {
    path: '/students/:studentId',
    Component: StudentDetail,
  },
  {
    path: '/students/:studentId/edit',
    Component: StudentEdit,
  },
  {
    path: '/assignments',
    Component: Assignments,
  },
  {
    path: '/assignments/create',
    Component: AssignmentCreate,
  },
  {
    path: '/assignments/:id',
    Component: AssignmentDetail,
  },
  {
    path: '/payments',
    Component: Payments,
  },
  {
    path: '/payments/:id',
    Component: PaymentDetail,
  },
  {
    path: '/analytics',
    Component: Analytics,
  },
  {
    path: '/settings',
    Component: Settings,
  },
  {
    path: '/faq',
    Component: FAQ,
  },
  {
    path: '/more',
    Component: More,
  },
  {
    path: '/notifications',
    Component: Notifications,
  },
]);
