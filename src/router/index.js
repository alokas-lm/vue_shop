import Vue from 'vue'
import Router from 'vue-router'
const login = () => import('../components/Login')
const home = () => import('../components/Home')
const welcome = () => import('../components/Welcome')
const users = () => import('../components/user/Users')
const role = () => import('../components/power/Rolelist')


Vue.use(Router)

// noinspection JSAnnotator
const routes = [
    {
      path: '',
      redirect: '/login'
    },
    {
      path: '/login',
      component: login
    },
    {
      path: '/home',
      component: home,
      redirect: '/welcome',
      children:[{
        path: '/welcome',
        component: welcome
      },
        {
          path: '/users',
          component: users
        },
        {
          path: '/roles',
          component: role
        }]
    },
    ]

const router = new Router({
  routes,
  mode: 'history',
})

router.beforeEach((to ,from, next) => {
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next 是一个函数，表示放行
  //next() 放行   next('/login') 强制跳转
  if (to.path == '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})


export default router


