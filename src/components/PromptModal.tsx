import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
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
    const { defaultValue } = this.props;
    const value = defaultValue || '';
    const oldDefaultValue = oldProps.defaultValue || '';
    if (oldDefaultValue !== value) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ value });
    }
  }

  private onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({
      value: event.target.value,
    });

  private onSubmit: React.FormEventHandler<HTMLElement> = async (event) => {
    // Do not actually submit the form
    const { onSubmit, defaultValue } = this.props;
    const { value } = this.state;
    event.preventDefault();
    if (this.isNonEmptyValue()) {
      await onSubmit(value.trim());
      this.setState({ value: defaultValue || '' });
    }
  };

  private isNonEmptyValue = () => {
    const { value } = this.state;
    return !!(value && value.trim());
  };

  public render() {
    const { open, onClose, label, title, closeButtonText, submitButtonText } = this.props;
    const { value } = this.state;
    return (
      <Dialog aria-labelledby="prompt-modal-title" open={open} onClose={onClose}>
        <form>
          <DialogTitle id="prompt-modal-title">{title}</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="normal" label={label} value={value} onChange={this.onChange} fullWidth />
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={onClose}>
              {closeButtonText}
            </Button>
            <Button color="primary" type="submit" onClick={this.onSubmit} disabled={!this.isNonEmptyValue()}>
              {submitButtonText}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default PromptModal;
