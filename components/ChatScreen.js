import { Avatar, IconButton } from "@material-ui/core";
import { AttachFile, InsertEmoticon, Mic, MoreVert } from "@material-ui/icons";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import styled from "styled-components";
import { auth, db } from "../firebase";
import Message from "./Message";
import firebase from 'firebase'
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from 'timeago-react'

function ChatScreen({ chat, messages }) {
    const [user] = useAuthState(auth)
    const router = useRouter()
    const [input, setInput] = useState("")
    const endOfMessage = useRef(null)
    const [messagesSnapshot] = useCollection(db
        .collection('chats')
        .doc(router.query.id)
        .collection('messages')
        .orderBy('timestamp', 'asc'))

    const [recipientSnapshot] = useCollection(db.collection('users').where('email', '==', getRecipientEmail(chat.users, user)))

    const showMessages = () => {
        if (messagesSnapshot) {
            return messagesSnapshot.docs.map(message => (
                <Message
                    key={message.id}
                    user={message.data().user}
                    message={{
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime(),
                    }} />
            ))
        } else {
            return JSON.parse(messages).map(message => (
                <Message key={message.id} user={message.user} message={message} />
            ))
        }
    }

    const scrollToBottom = () => {
        endOfMessage.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }

    const sendMessage = (e) => {
        e.preventDefault();
        db.collection("user").doc(user.uid).set({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true })

        db.collection('chats').doc(router.query.id).collection('messages').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            user: user.email,
            photoURL: user.photoURL,
        })

        setInput('')
        scrollToBottom()
    }

    const recipient = recipientSnapshot?.docs?.[0]?.data()
    const recipientEmail = getRecipientEmail(chat.users, user)

    return (
        <Container>
            <Header>
                {recipient ? (
                    <Avatar src={recipient?.photoURL} />
                ) : (
                    <Avatar>{recipientEmail[0]}</Avatar>
                )}
                <HeaderInfomation>
                    <h3>{recipientEmail}</h3>
                    {recipientSnapshot ? (
                        <p>Last active: {' '}{recipient?.lastSeen?.toDate() ? (
                            <TimeAgo dateTime={recipient?.lastSeen?.toDate()} />
                        ) : "Unavailable"}</p>
                    ) : (
                        <p>Loading Last active...</p>
                    )}
                </HeaderInfomation>
                <HeaderIcons>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </HeaderIcons>
            </Header>

            <MessageContainer>
                {showMessages()}
                <EndofMessage ref={endOfMessage} />
            </MessageContainer>

            <InputContainer>
                <InsertEmoticon />
                <Input value={input} onChange={e => setInput(e.target.value)} />
                <button hidden disabled={!input} type="submit" onClick={sendMessage}>Send Message</button>
                <Mic />
            </InputContainer>
        </Container>
    );
}

export default ChatScreen;

const Container = styled.div`

`;

const Header = styled.div`
position: sticky;
background-color: white;
z-index: 100;
top: 0;
display: flex;
padding: 11px;
height: 80px;
align-items: center;
border-bottom: 1px solid whitesmoke;
`;

const HeaderInfomation = styled.div`
margin-left: 15px;
flex: 1;

> h3 {
    margin-bottom: 3px;
}

> p {
    font-size: 14px;
    color: gray;
}
`;

const MessageContainer = styled.div`
padding: 30px;
background-color: #e5ded8;
min-height: 90vh;
`;

const EndofMessage = styled.div`
margin-bottom: 50px;
`;

const HeaderIcons = styled.div``;

const InputContainer = styled.form`
display: flex;
align-items: center;
padding: 10px;
position: sticky;
bottom: 0;
background-color: white;
z-index: 100;
`;

const Input = styled.input`
flex: 1;
padding: 20px;
background-color: whitesmoke;
outline: 0;
border: none;
border-radius: 10px;
margin-left: 15px;
margin-right: 15px;
`;