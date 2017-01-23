import React, { PropTypes } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import rest from "../utils/rest";

class User extends React.Component {
  render() {
    const { userRepos } = this.props;
    const Repos = userRepos.data.map(
      (item)=> (<Link className="list-group-item"
        key={item.name} to={`/${item.user}/${item.name}`}>
          { item.name }
      </Link>));
    return (
      <div className="User list-group">
        { Repos }
      </div>
    );
  }
}

User.propTypes = {
  userRepos: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  const { user } = ownProps.params;
  return { userRepos: rest.cachedState.userRepos(state.userRepos, { user }) };
}

export default connect(mapStateToProps)(User);
