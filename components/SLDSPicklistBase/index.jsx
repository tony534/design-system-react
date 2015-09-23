/*
Copyright (c) 2015, salesforce.com, inc. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import React, { Component } from 'react';
import SLDSPopover from '../SLDSPopover';
import List from './list';

import {InputIcon, ButtonIcon} from "./../SLDSIcons";
import {Icon} from "../SLDSIcons";

import {KEYS,EventUtil} from '../utils';


module.exports = React.createClass( {

  getDefaultProps(){
    return {
      placeholder: 'Select an Option',
      disabled: false,
      theme: 'default',
      label: 'Picklist',
      value: null,
      options: [],
      initialFocus: false,
      onClick () {
        console.log('onClick should be defined');
      },
      onSelect (value){
        console.log('onItemSelect should be defined');
      },
      onUpdateHighlighted (nextIndex) {
        console.log('onUpdateHighlighted should be defined');
      }
    }
  },

  getInitialState(){
    return {
      isOpen:false,
      isFocused:false,
      highlightedIndex:0,
      selectedIndex:this.getIndexByValue(this.props.value),
      lastBlurredIndex:-1,
      lastBlurredTimeStamp:-1
    };
  },

  componentDidMount () {
    if(this.props.initialFocus){
 //     setTimeout(()=>{
        this.setFocus();
//        this.setState({isFocused:true});
 //     }.bind(this),100);
    }
  },

  getIndexByValue(value){
    let foundIndex = -1;
    if(this.props.options && this.props.options.length){
      this.props.options.some((element, index, array)=>{
        if(element && element.value === value){
          foundIndex = index;
          return true;
        }
        return false;
      });
    }
    return foundIndex;
  },

  getValueByIndex(index){
    return this.props.options[index].value;
  },

  handleSelect(index) {
    this.setState({selectedIndex:index})
    this.setFocus();
    if(this.props.onSelect){
      this.props.onSelect(this.getValueByIndex(index));
    }
  },

  handleClose() {
    this.setState({isOpen:false});
  },

  handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({isOpen:true});
    if(this.props.onClick){
      this.props.onClick();
    }
  },

  handleBlur(e) {
    this.setState({isFocused:false});
  },

  handleFocus() {
    this.setState({isFocused:true});
  },

  setFocus () {
    if(this.isMounted()){
      React.findDOMNode(this.refs.button).focus();
    }
  },

  moveHighlight(delta) {
  },

  handleKeyDown(event) {
    if (event.keyCode){
      if (event.keyCode === KEYS.ENTER || 
          event.keyCode === KEYS.SPACE || 
          event.keyCode === KEYS.DOWN || 
          event.keyCode === KEYS.UP){
        EventUtil.trapEvent(event);
        this.setState({
          isOpen:true,
          highlightedIndex:0
        });
      }
    }
  },

  handleUpdateHighlighted(nextIndex){
    this.setState({highlightedIndex:nextIndex});
  },

  handleListBlur(){
    this.setState({isOpen:false});
  },

  handleCancel () {
    this.setFocus();
  },

  getPopover() {
    return (
      !this.props.disabled && this.state.isOpen?
        <div 
          ref="popover"
          className="slds-dropdown slds-dropdown--left slds-dropdown--small slds-dropdown--menu" 
          targetElement={this.refs.button} 
          style={{maxHeight:'20em'}}>
          <List
            ref='list'
            options={this.props.options}
            label={this.props.label}
            highlightedIndex={this.state.highlightedIndex}
            selectedIndex={this.state.selectedIndex}
            onSelect={this.handleSelect} 
            onUpdateHighlighted={this.handleUpdateHighlighted} 
            onListBlur={this.handleListBlur}
            onListItemBlur={this.handleListItemBlur}
            onCancel={this.handleCancel}
            theme={this.props.theme} />
        </div>:null
    );
  },

  getPlaceholder() {
    const option = this.props.options[this.state.selectedIndex];
    return (option && option.label)?option.label:this.props.placeholder;
  },

  handleListItemBlur (index, relatedTarget) {
    this.setState({
      lastBlurredIndex:index,
      lastBlurredTimeStamp:Date.now()
    });
  },

  render() {
    let className = this.state.currentSelectedItem? 'slds-input--bare slds-hide':'slds-input--bare';
    return (

      <div className={"slds-form-element  ignore-react-onclickoutside slds-theme--"+this.props.theme}>
        <div className={"slds-picklist slds-theme--"+this.props.theme}>
        <form>
          <button 
            id={this.props.id}
            ref="button"
            className="slds-button slds-button--neutral slds-picklist__label" 
            aria-haspopup="true"
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onClick={this.handleClick}
            tabIndex={this.state.isOpen?-1:0}
            onKeyDown={this.handleKeyDown} >
            <span className="slds-truncate">{this.getPlaceholder()}</span>
            <Icon name="down" category="utility" />
          </button>

          {this.getPopover()}
        </form>

        </div>

      </div>
    );
  },

  componentDidUpdate( prevProps, prevState) {
    if(this.state.lastBlurredTimeStamp !== prevState.lastBlurredTimeStamp){
      if(this.state.lastBlurredIndex === this.state.highlightedIndex){
        this.handleClose();
      }
    }
    if(this.state.selectedIndex !== prevState.selectedIndex){
      this.handleClose();
    }
    else if(this.state.isFocused && !prevState.isFocused){
      this.setState({isOpen:false});
    }
    else if(!this.state.isFocused && prevState.isFocused){
      if(this.refs.list){
        if(this.isMounted() && this.refs.list){
          if(this.refs.list.getDOMNode().contains(document.activeElement)){
            return;
          }
          this.setState({isOpen:false})
        }
      }
    }

    if(this.props.value !== prevProps.value){
      this.handleSelect(this.getIndexByValue(this.props.value));
    }
  },

});