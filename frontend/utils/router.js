import VueRouter from 'vue-router'
import avLogin from '../components/views/av-login.vue'
import avLogged from '../components/views/av-logged.vue'
import avMessages from '../components/views/av-messages.vue'
import avCode from '../components/views/av-code.vue'
import avWhiteboard from '../components/views/av-whiteboard.vue'
import avFiles from '../components/views/av-files.vue'
import avPdf from '../components/views/av-pdf.vue'
import avHome from '../components/views/av-home.vue'

import store from './store'

let routes = [
	{
		path: '/',
		component: avLogin,
		beforeEnter: (to, from, next) => {
			if(store.state.token)
				next('/home');
			else
				next();
		},
	},
	{
		path: '/home',
		component: avHome,
		beforeEnter: (to, from, next) => {
			if(store.state.token)
				next();
			else
				next('/login');
		},
	},
	{
		path: '*',
		component: avLogged,
		children: [
			{
				path: 'messages',
				component: avMessages
			},
			{
				path: 'code',
				component: avCode
			},
			{
				path: 'whiteboard',
				component: avWhiteboard
			},
			{
				path: 'files',
				component: avFiles
			},
			{
				path: 'pdf',
				component: avPdf
			}
		]
	},
]

export default new VueRouter({
	routes,
});