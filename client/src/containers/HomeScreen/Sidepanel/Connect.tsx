import React, { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { KafkaState } from '../../../state/reducers/kafkaDataReducer';
import { overallState } from '../../../state/reducers';
import {
  connectedActionCreator,
  populateDataActionCreator,
  populateNotifActionCreator,
  appendNotifActionCreator,
} from '../../../state/actions/actions';
import { populateData } from '../../../helperFunctions/populateData';
import WebSocket from 'ws';

// importing IPC renderer form Electron
const { ipcRenderer } = window.require('electron');

// importing componenets from Material UI
import {
  Button,
  Card,
  List,
  Divider,
  Typography,
  Input,
  makeStyles,
} from '@material-ui/core';

interface Options {
  headers: {};
  body: string;
  method: string;
}
// export let ws: any;

// styles for connect Component
const useStyles = makeStyles({
  form: {
    alignSelf: 'start',
    margin: 30,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: 'auto',
    width: 'auto',

    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overline: {
    fontWeight: 'lighter',
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: 'red',
  },
});

const Connect: FC = (props) => {
  // display form function -> onSubmit -> send fetch request to backend with Broker URI
  const isConnected = useSelector<overallState, KafkaState['isConnected']>(
    (state) => state.kafka.isConnected
  );

  const dispatch = useDispatch();

  // creating a classes variable to customize styles
  const classes = useStyles();

  const handleSubmit = (e: any) => {
    // console.log("make it inside handlesubmit");
    e.preventDefault();
    let method;
    let inputField: HTMLInputElement | null =
      document.querySelector('#brokerID');
    let body;
    if (inputField) {
      // console.log(inputField.value);
      // move down to fetch
      body = JSON.stringify({ PORT: inputField.value });
    } else {
      alert('Cannot connect because Broker ID field is empty');
      return;
    }

    if (!isConnected) {
      method = 'POST';
      console.log('106 =>', inputField);
    } else {
      method = 'PUT';
    }

    const options: Options = {
      method,
      headers: { 'content-type': 'application/json' },
      body,
    };
    // move down into fetch
    console.log(options);
    //edit the fetch api
    fetch('/api/connect', options)
      .then((data) => data.json())
      .then((data) => {
        fetch('/api/notification', {
          method: 'GET',
          headers: { 'content-type': 'application/json' },
        })
          .then((data: any) => data.json())
          .then((data: Error[]) => {
            console.log(data);
            dispatch(populateNotifActionCreator(data));

            // open a websocket connection
            const ws = new WebSocket('ws://localhost:3000/errors');
            ws.onopen = () => {
              console.log('connected to websocket for error');
              ws.send('Errors');
            };
            ws.onmessage = (data) => {
              console.log('error message received:', data);
              // dispatch(appendNotifActionCreator(data));
            };
          })
          .catch((e: any) =>
            console.log('error in fetching data from notifs', e)
          );
        // console.log(data);
        // const { metadata: { topics: array } } = data;
        // const array = data.metadata.topics;
        // const rows = array.map( (el:any) => createData(el.name, el.partitions.length, el.partitions));
        // dispatch(populateDataActionCreator(rows));
        dispatch(connectedActionCreator());
        populateData(data, dispatch);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleUpload = (e: any) => {
    ipcRenderer.send('upload-file');
  };

  return (
    <form className={classes.form}>
      <Card className={classes.card}>
        <Typography variant='subtitle1' className={classes.title}>
          Enter Your Broker Port Number
        </Typography>
        <Divider></Divider>
        <Input
          id='brokerID'
          name='brokerID'
          type='number'
          placeholder='9092'
          // required={true}
          autoFocus={true}
        ></Input>
        <Button
          className={classes.button}
          variant='contained'
          color='primary'
          onClick={handleSubmit}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
          {/* {isConnected && <Redirect to='/partition'/>} */}
        </Button>
        <div style={{ marginBottom: 20 }}></div>
        <Typography variant='subtitle2' className={classes.title}>
          Upload Your Docker-compose File
        </Typography>
        <Button
          size='small'
          variant='outlined'
          color='primary'
          id='uploadButton'
          onClick={handleUpload}
        >
          Upload
        </Button>
      </Card>
    </form>
  );
};

export default Connect;
