import React from 'react';

export default class ErrorBoundary extends React.Component { // making this "Pure" breaks React-Router
 
    state = { error: null, errorInfo: null };

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
        // You can also log error messages to an error reporting service here
    }

    render() {
        if (this.state.errorInfo) {
            // Error path
            return (
                <div>
                    <h1>Something went wrong.</h1>
                    <pre>
                        {String(this.state.error)}
                        {this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

// <code>{this.state.error.stack}</code>
// <hr style={{margin: '2px 0'}}/>
// <code>{this.state.errorInfo.componentStack.replace(/^\s*\r?\n/, '')}</code>