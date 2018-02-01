import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Box, Button, Divider, Heading } from 'rebass';
import { bindActionCreators } from 'redux';

import FormStateStart from '../components/FormStateStart';

class StateStart extends Component {
  showResults = data => {
    console.log(data);
  };

  render() {
    const { goTo } = this.props;

    return (
      <Box py={4}>
        <Heading>Let’s start by setting up your state profile</Heading>
        <FormStateStart onSubmit={this.showResults} />
        <Divider my={4} color="gray2" />
        <Button onClick={() => goTo('/state-contacts')}>Continue</Button>
      </Box>
    );
  }
}

StateStart.propTypes = {
  goTo: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch =>
  bindActionCreators({ goTo: path => push(path) }, dispatch);

export default connect(null, mapDispatchToProps)(StateStart);