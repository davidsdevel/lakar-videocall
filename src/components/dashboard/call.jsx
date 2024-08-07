import {useEffect, useRef, useState, useCallback} from 'react';
import {useSocket, useUser} from '@/components/dashboard/context';
import {FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaSync, FaVideo, FaVideoSlash} from 'react-icons/fa';

const userContraints = {
  audio: true,
  video: {
    facingMode: 'user',
    'width': {'max': 426},
    'height': {'max': 240}
  }
};

const RTCconfiguration = {
  iceServers: [ 
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302'
      ] 
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

const startCall = async (socket, pc, stream, callID, to) => {
  pc.onicecandidate = event => {
    if (event.candidate)
      socket.emit('caller', {callID, candidate: event.candidate});
  };

  socket.on('offer-answer', async data => {
    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  });

  socket.on('callee', ({candidate}) => {
    if (pc.currentRemoteDescription)
      pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  const offerDescription = await pc.createOffer({iceRestart: true});
  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type
  };
  
  socket.emit('init-call', {
    callID,
    to,
    offer
  });
};

const joinCall = async (socket, pc, callID) => {

  pc.onicecandidate = (event) => {
    if (event.candidate)
      socket.emit('callee', {callID, candidate: event.candidate});
  };

  socket.on('caller', ({candidate}) => {
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  });

  const offer = await new Promise(resolve => socket.emit('get-offer', callID, resolve));
  const candidates = await new Promise(resolve => socket.emit('get-candidates', callID, resolve));

  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    callID,
    answer: {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    }
  };

  socket.emit('answer', answer);

  candidates.forEach(e => {
    const candidate = new RTCIceCandidate(e);

     pc.addIceCandidate(candidate);
  });
};

export default function Call({onEndCall, friendID, isCaller}) {
  const receiverRef = useRef(null);
  const callIdRef = useRef(null);
  const senderRef = useRef(null);
  const pcRef = useRef(null);

  const remoteStreamRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isFrontalCamera, setIsFrontalCamera] = useState(true);
  const [signalingState, setSignalingState] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('');
  const [hasVideo/*, setHasVideo*/] = useState(true);
  const [iceConnectionState, setIceConnectionState] = useState('');

  const socket = useSocket();
  const {user, friends} = useUser();

  const endCall = useCallback(() => {
    if (pcRef.current)
      pcRef.current.close();

    if (receiverRef.current) {
      receiverRef.current.srcObject.getTracks().forEach(track => track.stop());
      receiverRef.current.srcObject = null;    
    }

    if (senderRef.current) {
      senderRef.current.srcObject.getTracks().forEach(track => track.stop());
      senderRef.current.srcObject = null;
    }

    onEndCall();
  }, [onEndCall]);

  const flipCamera = async () => {
    if (pcRef.current) {
      const oldVideo = senderRef.current.srcObject.getVideoTracks()[0];

      oldVideo.stop();

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: !isFrontalCamera ? 'user' : 'environment',
          'width': {'max': 426},
          'height': {'max': 240}
        }
      });

      const videoTrack = newStream.getVideoTracks()[0];

      const sender = pcRef.current.getSenders().find(s => s.track.kind == videoTrack.kind);

      await sender.replaceTrack(videoTrack);

      senderRef.current.srcObject.removeTrack(oldVideo);
      senderRef.current.srcObject.addTrack(videoTrack);

      setIsFrontalCamera(!isFrontalCamera);
    }
  };

  const toggleMicro = async () => {
    if (pcRef.current) {
      const track = senderRef.current.srcObject.getAudioTracks()[0];

      track.enabled = isMuted;

      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(userContraints)
      .then(localStream => {
        const remoteStream = new MediaStream();

        remoteStreamRef.current = remoteStream;
        localStreamRef.current = localStream;

        if (receiverRef.current)
          receiverRef.current.srcObject = remoteStream;
        
        if (senderRef.current)
          senderRef.current.srcObject = localStream;

        const pc = new RTCPeerConnection(RTCconfiguration);

        pcRef.current = pc;

        pc.ontrack = e => e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        pc.oniceconnectionstatechange = () => setIceConnectionState(pc.iceConnectionState);
        pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
        pc.onsignalingstatechange = () => setSignalingState(pc.signalingState);

        socket.on('end-call', endCall);

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        //Get CallID
        socket.emit('get-call-id', {from: user._id, to: friendID}, _callID => {
          callIdRef.current = _callID;

          if (isCaller) {
            startCall(socket, pc, localStream, _callID, user._id);
          } else {
            joinCall(socket, pc, _callID);
          }
        });
      })
      .catch((err) => {
        alert('You need approve camera access');
        throw err;
      });

    return () => {
      pcRef.current = null;
      senderRef.current = null;
      callIdRef.current = null;
      receiverRef.current = null;

      socket.off('end-call', endCall);
    };
  }, [socket, endCall, friendID, user._id, isCaller]);

  return <div className='fixed w-full h-full top-0 flex flex-col items-center z-20'>
    <div id='main-screen' className='w-full h-full bg-slate-800 grow flex items-center justify-center relative'>
      <div className='fixed top-4 left-4 bg-[#0003] p-4 rounded-lg text-white fot-bold z-30'>
        <div>Status: {connectionState}</div>
        <div>Signaling: {signalingState}</div>
        <div>ICE: {iceConnectionState}</div>
      </div>  
      <div className='fixed w-full h-full flex items-center justify-center'>
        <img src={friends[friendID].profilePicture} alt='' className='rounded-full'/>
      </div>
      <video ref={receiverRef} className='z-10 w-full h-full max-w-full max-h-full' autoPlay/>
      <video ref={senderRef} autoPlay muted className='absolute top-4 right-4 w-24 md:w-40'/>
    </div>
    <div className='absolute z-20 bg-[#fff2] justify-between flex items-center rounded-full bottom-4'>
      <button className='flex m-2 items-center justify-center p-5 bg-main-700 rounded-full h-fit' onClick={flipCamera}>
        <FaSync className='text-white'/>
      </button>
      <button className='flex m-2 items-center justify-center p-5 bg-main-700 rounded-full h-fit'>
        {
          hasVideo
           ? <FaVideoSlash className='text-white'/>
           : <FaVideo className='text-white'/>
        }
      </button>
      <button className='flex m-2 items-center justify-center p-5 bg-main-700 rounded-full h-fit' onClick={toggleMicro}>
        {
          isMuted
            ? <FaMicrophone className='text-white'/>
            : <FaMicrophoneSlash className='text-white'/>
        }
      </button>
      <button className='flex m-2 items-center justify-center p-5 bg-red-500 rounded-full' onClick={() => {
        socket.emit('end-call', {callID: callIdRef.current});
        endCall();
      }}>
        <FaPhoneSlash className='text-white'/>
      </button>
    </div>
  </div>;  
}
