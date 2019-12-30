import React from 'react';
import './App.css';
import './button.css';
import config from './awsConfig';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { instanceStatus: '' };
    this.ec2 = new window.AWS.EC2(config.ec2);
  }

  componentDidMount() {
    this.monitorInstanceStatus();
    setInterval(this.monitorInstanceStatus.bind(this), config.monitorRefreshTime);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <ul className="button-group">
            <StartInstance ec2={this.ec2} updateInstanceStatus={this.updateInstanceStatus.bind(this)} />
            <StopInstance ec2={this.ec2} updateInstanceStatus={this.updateInstanceStatus.bind(this)} />
          </ul>
          <InstanceStatusMonitor instanceStatus={this.state.instanceStatus} />
        </header>
      </div>
    );
  }

  monitorInstanceStatus() {
    const params = {
      InstanceIds: [config.instanceId]
    };
    this.ec2.describeInstanceStatus(
      params,
      function(err, data) {
        if (err) console.log(err, err.stack);
        else {
          console.log(data);
          const instanceStatus =
            (data &&
              data.InstanceStatuses &&
              data.InstanceStatuses[0] &&
              data.InstanceStatuses[0].InstanceState &&
              data.InstanceStatuses[0].InstanceState.Name) ||
            this.state.instanceStatus;
          this.updateInstanceStatus(instanceStatus);
        }
      }.bind(this)
    );
  }

  updateInstanceStatus(status) {
    if (status !== this.state.instanceStatus) {
      this.setState({ instanceStatus: status });
    }
  }
}

function StopInstance(props) {
  const stopper = () => {
    props.updateInstanceStatus('stopping');

    const params = {
      InstanceIds: [config.instanceId],
      DryRun: false,
      Force: false
    };

    props.ec2.stopInstances(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
      setTimeout(() => props.updateInstanceStatus('stopped'), 30000);
    });
  };

  return (
    <li>
      <button onClick={stopper} className="large red button">
        Stop Instance
      </button>
    </li>
  );
}

function StartInstance(props) {
  const starter = () => {
    props.updateInstanceStatus('starting');

    const params = {
      InstanceIds: [config.instanceId]
    };

    props.ec2.startInstances(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  };

  return (
    <li>
      <button onClick={starter} className="large green button">
        Start Instance
      </button>
    </li>
  );
}

function InstanceStatusMonitor(props) {
  return (
    <span className="instanceStatus">
      <a className="App-link" href="https://jacobperuva.com">
        jacobperuva.com
      </a>{' '}
      - {props.instanceStatus}
    </span>
  );
}

export default App;
