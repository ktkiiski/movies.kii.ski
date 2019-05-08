import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
  title: string;
  label: string;
  closeButtonText: string;
  submitButtonText: string;
  defaultValue?: string | null;
}

interface PromptModalState {
  value: string;
}

class PromptModal extends React.Component<PromptModalProps, PromptModalState> {
  constructor(props: PromptModalProps) {
    super(props);
    this.state = {
      value: props.defaultValue || '',
    };
  }
  public componentDidUpdate(oldProps: PromptModalProps) {
    const value = this.props.defaultValue || '';
    const oldDefaultValue = oldProps.defaultValue || '';
    if (oldDefaultValue !== value) {
      this.setState({ value });
    }
  }
  public render() {
    const { open, onClose } = this.props;
    return <Dialog
      aria-labelledby='prompt-modal-title'
      open={open}
      onClose={onClose}
    ><form>
      <DialogTitle id='prompt-modal-title'>
        {this.props.title}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='normal'
          label={this.props.label}
          value={this.state.value}
          onChange={this.onChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={onClose}>
          {this.props.closeButtonText}
        </Button>
        <Button color='primary' type='submit' onClick={this.onSubmit} disabled={!this.isNonEmptyValue()}>
          {this.props.submitButtonText}
        </Button>
      </DialogActions>
    </form></Dialog>;
  }
  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({
    value: event.target.value,
  })
  private onSubmit: React.FormEventHandler<HTMLElement> = async (event) => {
    // Do not actually submit the form
    event.preventDefault();
    if (this.isNonEmptyValue()) {
      await this.props.onSubmit(this.state.value.trim());
      this.setState({ value: this.props.defaultValue || '' });
    }
  }
  private isNonEmptyValue = () => {
    const { value } = this.state;
    return !!(value && value.trim());
  }
}

export default PromptModal;
