<template>
    <div class="topbar">
        <div class="topbar__top">
            <av-students></av-students>
            <ul class="topbar__iconmenu">
                <li :class="{'border-blue': !root}">
                    <a class="aaa" :title="$t('sideMenu.managed')">
                        <input type="checkbox" v-model="managed">
                    </a>
                </li>
                <li class="topbar__icon ripple" v-if="iAmTeacher">
                    <a class="aaa" @click="showUsers" :title="$t('code.title')">
                        <i class="fa fa-user"></i>
                    </a>
                </li>
                <li class="topbar__icon ripple">
                    <router-link to="/code" class="aaa" :title="$t('code.title')">
                        <i class="fa fa-code"></i>
                    </router-link>
                </li>
                <li class="topbar__icon ripple">
                    <router-link to="/files"  :title="$t('files.title')">
                    <i class="fa fa-files-o"></i>
                    </router-link>
                </li>
                <li class="topbar__icon ripple">
                    <router-link to="/whiteboard" :title="$t('whiteboard.title')">
                        <i class="fa fa-edit"></i>
                    </router-link>
                </li>
                <li class="topbar__icon ripple">
                    <router-link to="/pdf" :title="$t('pdf.title')">
                        <i class="fa fa-file-pdf-o"></i>
                    </router-link>
                </li>
                <li class="topbar__icon ripple">
                    <a @click="logout"  :title="$t('logout.title')">
                        <i class="fa fa-power-off"></i>
                    </a>
                </li>
            </ul>
        </div>
        <div class="topbar__bottom" :class="clases">
            <h1 class="topbar__title">{{ classroom.name.toUpperCase() }}</h1>
            <h2 class="topbar__subtitle">{{ classroom.teacher }}</h2>
            <a @click="shrink" class="topbar__hide">
                <i class="fa fa-angle-double-up" :class="rotate"></i>
            </a>
        </div>
    </div>
</template>
<script>
    import avStudents from '../views/av-students.vue'

	export default {
		name: 'topMenu',
        components: {
            avStudents
        },
        data() {
            return {
                selectedUser: {},
                clases: '',
                rotate: ''
            }
        },
        methods: {
            /**
             * Change the user controlling the
             * app and assets
             * 
             * @return void
             */
            changeUserInControl() {
                this.$socket.emit('users.controlling', this.selectedUser);
            },

            /**
             * Shrink top menu
             * 
             * @return void
             */
            shrink() {
                this.clases = this.clases ? '' : 'chiquito';
                this.rotate = this.rotate ? '' : 'fa-rotate-180';
                this.$store.commit('toggleTopMenu');
            },

            /**
             * Delete token and logout from
             * the app
             * 
             * @return void
             */
            logout() {
                this.$store.commit('setToken', '');
                this.$socket.emit('logout');
                this.$router.push('/');
            },

            showUsers() {
                this.$store.commit('showUsers');
            }
        },
        computed: {
            /**
             * Check if the user is root
             *
             * @return Boolean
             */
            root() {
                return this.$store.getters.root;
            },

            /**
             * Check if the user is the teacher
             *
             * @return Boolean
             */
            iAmTeacher() {
                return this.$store.getters.iAmTeacher;
            },

            /**
             * Return user info
             * 
             * @return Object (User)
             */
            myself() {
                return this.$store.getters.myself;
            },

            /**
             * Return a list of logged users
             * 
             * @return Array (Object/User)
             */
            users() {
                return this.$store.state.users;
            },

            /**
             * Bind the checkbox to Vuex state
             * 
             * @return void
             */
            managed: {
                get () {
                    return this.$store.state.managed;
                },
                set (value) {
                    this.$store.commit('setManaged', value);
                }
            },

            /**
             * Return the current classroom
             * 
             * @return Object
             */
            classroom() {
                return this.$store.state.classroom;
            }
        }
	}
</script>
<style>
    .topbar {
        position: fixed;
        z-index: 1500;
        top: 0;
        left: 0;
        /*height: 50px;*/
        width: 100%;
        background-color: #d32f2f;
        /*-webkit-box-shadow: 0px 5px 5px 0px rgba(0,0,0,0.75);
        -moz-box-shadow: 0px 5px 5px 0px rgba(0,0,0,0.75);
        box-shadow: 0px 5px 5px 0px rgba(0,0,0,0.75);*/
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    }
    .topbar__hide {
        background-color: #FFC107;
        position: absolute;
        height: 50px;
        width: 50px;
        font-size: 25px;
        display: flex;
        color: #FFF;
        align-items: center;
        justify-content: center;
        bottom: -25px;
        right: 25px;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.23), 0 3px 10px rgba(0, 0, 0, 0.16);
        border-right: none;
    }
    .topbar__title {
        margin: 0;
        color: #FFF;
        font-weight: normal;
        /*transition: font-size 0.5s linear;*/
    }
    .topbar__subtitle {
        color: #ffcdd2;
        margin: 0;
        font-weight: normal;
        font-size: 15px;
        /*transition: font-size 0.5s linear;*/
    }
    .topbar__top {
        height: 50px;
    }
    .topbar__bottom {
        height: 150px;
        background-color: #F44336;
        padding: 30px;
        transition: height 0.2s linear;
        overflow: hidden;
    }

    .chiquito {
        height: 50px;
        padding: 15px 30px;
    }
    .chiquito > h1 {
        font-size: 20px;
        float: left;
        line-height: 1;
        /*transition: font-size 0.1s linear;*/
    }
    .chiquito > h2 {
        font-size: 15px;
        float: left;
        /*transition: font-size 0.1s linear;*/
        margin-top: 2px;
        margin-left: 10px;
    }
    .topbar__iconmenu {
        align-items: center;
        display: flex;
        float: right;
        height: 100%;
        list-style: outside none none;
        margin: 0;
        padding: 0;
    }

    .topbar__icon {
        color: #fff;
        display: inline-block;
        float: left;
        font-size: 15px;
        padding: 10px 15px;
        cursor: pointer;
        transition: box-shadow 0.2s linear;
    }

        



        .ripple {
  overflow: hidden;
  transform: translate3d(0, 0, 0);
}
  .ripple::after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #000 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10,10);
    opacity: 0;
    transition: transform .5s, opacity 1s;
  }

  .ripple:active::after {
    transform: scale(0,0);
    opacity: .2;
    transition: 0s;
}



.aaa {
    padding: 5px;
}


</style>