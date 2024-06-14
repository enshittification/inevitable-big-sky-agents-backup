import { useDispatch, useSelect } from '@wordpress/data';
import { store as agentStore } from '../store/index.js';
import { useCallback } from 'react';

const useReduxChat = ( { token, service, model, temperature, feature } ) => {
	const {
		setStarted,
		clearError,
		setEnabled,
		addToolCall,
		addUserMessage,
		clearMessages,
		clearPendingToolRequests,
		setToolCallResult,
		runChatCompletion,
		runCreateThread,
		// runCreateAssistant,
		setAssistantId,
		runCreateThreadRun,
		runGetThreadRun,
	} = useDispatch( agentStore );

	const {
		error,
		started,
		enabled,
		running,
		toolRunning,
		history,
		assistantMessage,
		pendingToolRequests,
		threadId,
		assistantId,
		threadRun,
	} = useSelect( ( select ) => {
		const values = {
			error: select( agentStore ).getError(),
			started: select( agentStore ).isStarted(),
			running: select( agentStore ).isRunning(),
			toolRunning: select( agentStore ).isToolRunning(),
			enabled: select( agentStore ).isEnabled(),
			history: select( agentStore ).getMessages(),
			assistantMessage: select( agentStore ).getAssistantMessage(),
			pendingToolRequests: select( agentStore ).getPendingToolRequests(),
			threadId: select( agentStore ).getThreadId(),
			assistantId: select( agentStore ).getAssistantId(),
			threadRun: select( agentStore ).getCurrentThreadRun(),
		};
		return values;
	} );

	const runAgent = useCallback(
		( messages, tools, instructions, additionalInstructions ) => {
			if (
				! service || // no ChatModel
				! token || // no apiKey
				! enabled || // disabled
				running || // already running
				error || // there's an error
				! messages.length > 0 || // nothing to process
				pendingToolRequests.length > 0 || // waiting on tool calls
				assistantMessage // the assistant has a question for the user
			) {
				// console.warn( 'not running agent', {
				// 	chatModel,
				// 	error,
				// 	enabled,
				// 	running,
				// 	messages,
				// 	pendingToolRequests,
				// 	assistantMessage,
				// } );
				return;
			}
			runChatCompletion( {
				model,
				temperature,
				messages,
				tools,
				instructions,
				additionalInstructions,
				service,
				apiKey: token,
				feature,
			} );
		},
		[
			model,
			temperature,
			service,
			token,
			enabled,
			running,
			error,
			pendingToolRequests,
			assistantMessage,
			runChatCompletion,
			feature,
		]
	);

	const createThreadRun = useCallback(
		( tools, instructions, additionalInstructions ) => {
			if (
				! service || // no ChatModel
				! token || // no apiKey
				! assistantId || // disabled
				running || // already running
				error || // there's an error
				! enabled || // disabled
				pendingToolRequests.length > 0 || // waiting on tool calls
				assistantMessage // the assistant has a question for the user
			) {
				console.warn( 'not running assistant', {
					service,
					token,
					assistantId,
					running,
					error,
					enabled,
					pendingToolRequests,
					assistantMessage,
				} );
				return;
			}
			// first, create a thread (TODO: update existing thread!)
			// if ( ! threadId ) {
			// 	runCreateThread( { service, apiKey: token } );
			// } else {
			// 	console.warn( 'thread already exists', { threadId } );
			// }

			runCreateThreadRun( {
				service,
				apiKey: token,
				assistantId,
				threadId,
				model,
				temperature,
				tools,
				instructions,
				additionalInstructions,
				feature,
			} );
		},
		[
			service,
			token,
			assistantId,
			running,
			error,
			enabled,
			pendingToolRequests,
			assistantMessage,
			runCreateThreadRun,
			threadId,
			model,
			temperature,
			feature,
		]
	);

	const createThread = useCallback( () => {
		runCreateThread( { service, apiKey: token } );
	}, [ runCreateThread, service, token ] );

	const updateThreadRun = useCallback( () => {
		runGetThreadRun( { service, apiKey: token, threadId } );
	}, [ runGetThreadRun, service, token, threadId ] );

	const userSay = useCallback(
		( message, image_urls = [] ) => {
			addUserMessage( message, image_urls, threadId, service, token );
		},
		[ addUserMessage, service, threadId, token ]
	);

	const onReset = useCallback( () => {
		clearPendingToolRequests();
		clearMessages();
		clearError();
	}, [ clearError, clearMessages, clearPendingToolRequests ] );

	return {
		// running state
		running,
		toolRunning,
		enabled,
		setEnabled,
		started,
		setStarted,
		error,

		// messages
		history,
		clearMessages,
		userSay,
		agentMessage: assistantMessage,

		// tools
		call: addToolCall,
		setToolCallResult,
		pendingToolRequests,
		clearPendingToolRequests,

		runAgent, // run a chat completion with messages, tools, instructions and additionalInstructions

		// assistants
		threadId,
		createThread,
		assistantId,
		setAssistantId,

		createThreadRun, // run an assistant completion with messages and tools
		updateThreadRun, // refresh the assistant completion
		threadRun,

		onReset,
	};
};

export default useReduxChat;
