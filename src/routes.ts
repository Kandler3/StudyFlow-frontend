import { createBrowserRouter } from 'react-router';
import { Welcome } from './pages/Welcome';
import { Schedule } from './pages/Schedule';
import { LessonDetail } from './pages/LessonDetail';
import { Students } from './pages/Students';
import { StudentDetail } from './pages/StudentDetail';
import { Assignments } from './pages/Assignments';
import { AssignmentDetail } from './pages/AssignmentDetail';
import { Payments } from './pages/Payments';
import { PaymentDetail } from './pages/PaymentDetail';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { FAQ } from './pages/FAQ';
import { More } from './pages/More';
import { Notifications } from './pages/Notifications';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Welcome,
  },
  {
    path: '/schedule',
    Component: Schedule,
  },
  {
    path: '/schedule/:id',
    Component: LessonDetail,
  },
  {
    path: '/students',
    Component: Students,
  },
  {
    path: '/students/:id',
    Component: StudentDetail,
  },
  {
    path: '/assignments',
    Component: Assignments,
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
