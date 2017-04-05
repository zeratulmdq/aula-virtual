<template>
    <div class="bottombar">
        <textarea v-model="message" 
                   type="text" 
                   class="bottombar__text" 
                   :placeholder="$t('bottomMenu.sendPlaceholder')" 
                   name="message"
                   @keyup.enter="send">
        </textarea>
        <div class="bottombar__messages direct-chat direct-chat-danger">
            <div class="direct-chat-messages" ref="scrollDiv">
                <av-message @inDom="scrollDown($event)" v-for="message in messages" :msg="message"></av-message>
            </div>
        </div>
        <a @click="send" class="bottombar__send btn__danger"><i class="fa fa-envelope-o" aria-hidden="true"></i></a>
    </div>
</template>
<script>
    import avMessage from '../partials/av-message.vue'

	export default {
		name: 'bottomMenu',
        components: {
            avMessage,
        },
        data() {
            return {
                message: ''
            }
        },
        computed: {
            /**
             * Return the cleared user input 
             * 
             * @return String
             */
            realInput() {
                return this.message.trim();
            },

            /**
             * Return all stored messages
             * 
             * @return Array    List of messages
             */
            messages() {
                return this.$store.state.messages;
            },
        },
        methods: {
            /**
             * Send a new message
             * 
             * @return void
             */
            send() {
                if(this.realInput)
                {
                    this.$socket.emit('message', this.message);
                    this.message = '';
                }
            },

            /**
             * Set scroll position equals to
             * the bottom of the container div
             * 
             * @return void
             */
            goToBottom() {
                this.$refs.scrollDiv.scrollTop = this.$refs.scrollDiv.scrollHeight;
            },

            /**
             * Check if the app should scroll
             * to the bottom of the container div
             * 
             * @param  Int size     Size of recently inserted children
             * @return void
             */
            scrollDown(size) {
                let scrollTop = this.$refs.scrollDiv.scrollTop,
                    scrollHeight = this.$refs.scrollDiv.scrollHeight,
                    totalHeight = this.$refs.scrollDiv.offsetHeight;

                if(totalHeight + scrollTop + size + 40 > scrollHeight)
                    this.goToBottom();
            },
        }
	}
</script>
<style>
    .bottombar {
        position: fixed;
        right: 15px;
        bottom: 15px;
        color: #444;
        overflow: visible;
        padding: 10px;
        width: 300px;
        z-index: 700;
        box-sizing: border-box;
        display: flex;
    }

    .bottombar__send {
        position: absolute;
        height: 50px;
        width: 50px;
        font-size: 25px;
        display: flex;
        color: #FFF;
        align-items: center;
        justify-content: center;
        bottom: -8px;
        right: 0;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.23), 0 3px 10px rgba(0, 0, 0, 0.16);
        border-right: none;
        z-index: 1500;
    }

    .bottombar__text {
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
        border-right: none;
        flex-grow: 100;
        padding: 6px 12px;
        display: block;
        font-size: 14px;
        height: 34px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        position: absolute;
        bottom: 0;
        right: 15px;
        z-index: 1000;
        width: 300px;
    }

    /*.bottombar__text:hover + .bottombar__messages,*/
    .bottombar__text:focus  + .bottombar__messages{
        height: 400px;
    }

    .bottombar__messages {
        background-color: #FFF;
        position: absolute;
        bottom: 32px;
        right: 15px;
        z-index: 500;
        width: 100%;
        height: 0;
        border: 1px solid #CCC;
        overflow: hidden;
        transition: height 0.2s linear;
    }

    /*
 * Component: Direct Chat
 * ----------------------
 */
.direct-chat .box-body {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  position: relative;
  overflow-x: hidden;
  padding: 0;
}
.direct-chat.chat-pane-open .direct-chat-contacts {
  -webkit-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  -o-transform: translate(0, 0);
  transform: translate(0, 0);
}
.direct-chat-messages {
  -webkit-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  -o-transform: translate(0, 0);
  transform: translate(0, 0);
  padding: 10px;
  height: 100%;
  /*height: 250px;*/
  overflow: auto;
}
.direct-chat-msg,
.direct-chat-text {
  display: block;
}
.direct-chat-msg {
  margin-bottom: 10px;
  max-width: 80%;
  /*margin-right: 20%;*/
  float: left;
}
.direct-chat-msg:before,
.direct-chat-msg:after {
  content: " ";
  display: table;
}
.direct-chat-msg:after {
  clear: both;
}
.direct-chat-messages,
.direct-chat-contacts {
  -webkit-transition: -webkit-transform 0.5s ease-in-out;
  -moz-transition: -moz-transform 0.5s ease-in-out;
  -o-transition: -o-transform 0.5s ease-in-out;
  transition: transform 0.5s ease-in-out;
}
.direct-chat-text {
  border-radius: 5px;
  position: relative;
  padding: 5px 10px;
  background: #d2d6de;
  border: 1px solid #d2d6de;
  margin: 5px 0 0 50px;
  color: #444444;
  word-break: break-all;
}
.direct-chat-text:after,
.direct-chat-text:before {
  position: absolute;
  right: 100%;
  top: 15px;
  border: solid transparent;
  border-right-color: #d2d6de;
  content: ' ';
  height: 0;
  width: 0;
  pointer-events: none;
}
.direct-chat-text:after {
  border-width: 5px;
  margin-top: -5px;
}
.direct-chat-text:before {
  border-width: 6px;
  margin-top: -6px;
}
.right .direct-chat-text {
  margin-right: 50px;
  margin-left: 0;
}
.right .direct-chat-text:after,
.right .direct-chat-text:before {
  right: auto;
  left: 100%;
  border-right-color: transparent;
  border-left-color: #d2d6de;
}
.direct-chat-img {
  border-radius: 50%;
  float: left;
  width: 40px;
  height: 40px;
}
.right .direct-chat-img {
  float: right;
}
.direct-chat-info {
  display: block;
  margin-bottom: 2px;
  font-size: 14px;
  overflow: auto;
}
.direct-chat-name {
  font-weight: 600;
}
.direct-chat-timestamp {
  color: #999;
}
.direct-chat-contacts-open .direct-chat-contacts {
  -webkit-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  -o-transform: translate(0, 0);
  transform: translate(0, 0);
}
.direct-chat-contacts {
  -webkit-transform: translate(101%, 0);
  -ms-transform: translate(101%, 0);
  -o-transform: translate(101%, 0);
  transform: translate(101%, 0);
  position: absolute;
  top: 0;
  bottom: 0;
  height: 250px;
  width: 100%;
  background: #222d32;
  color: #fff;
  overflow: auto;
}
.contacts-list > li {
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  padding: 10px;
  margin: 0;
}
.contacts-list > li:before,
.contacts-list > li:after {
  content: " ";
  display: table;
}
.contacts-list > li:after {
  clear: both;
}
.contacts-list > li:last-of-type {
  border-bottom: none;
}
.contacts-list-img {
  border-radius: 50%;
  width: 40px;
  float: left;
}
.contacts-list-info {
  margin-left: 45px;
  color: #fff;
}
.contacts-list-name,
.contacts-list-status {
  display: block;
}
.contacts-list-name {
  font-weight: 600;
}
.contacts-list-status {
  font-size: 12px;
}
.contacts-list-date {
  color: #aaa;
  font-weight: normal;
}
.contacts-list-msg {
  color: #999;
}

.direct-chat-danger .right > .direct-chat-text {
  background: #F44336;
  border-color: #F44336;
  color: #ffffff;
}
.direct-chat-danger .right > .direct-chat-text:after,
.direct-chat-danger .right > .direct-chat-text:before {
  border-left-color: #F44336;
}
.direct-chat-primary .right > .direct-chat-text {
  background: #3c8dbc;
  border-color: #3c8dbc;
  color: #ffffff;
}
.direct-chat-primary .right > .direct-chat-text:after,
.direct-chat-primary .right > .direct-chat-text:before {
  border-left-color: #3c8dbc;
}
.direct-chat-warning .right > .direct-chat-text {
  background: #f39c12;
  border-color: #f39c12;
  color: #ffffff;
}
.direct-chat-warning .right > .direct-chat-text:after,
.direct-chat-warning .right > .direct-chat-text:before {
  border-left-color: #f39c12;
}
.direct-chat-info .right > .direct-chat-text {
  background: #00c0ef;
  border-color: #00c0ef;
  color: #ffffff;
}
.direct-chat-info .right > .direct-chat-text:after,
.direct-chat-info .right > .direct-chat-text:before {
  border-left-color: #00c0ef;
}
.direct-chat-success .right > .direct-chat-text {
  background: #00a65a;
  border-color: #00a65a;
  color: #ffffff;
}
.direct-chat-success .right > .direct-chat-text:after,
.direct-chat-success .right > .direct-chat-text:before {
  border-left-color: #00a65a;
}

.direct-chat-msg.right {
    /*margin-left: 20%;*/
    float: right;
}
</style>