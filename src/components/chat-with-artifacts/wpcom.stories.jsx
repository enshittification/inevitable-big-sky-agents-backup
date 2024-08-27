import { WPCOMChatWithArtifacts } from './index.jsx';

export default {
	title: 'Example/WPCOMChatWithArtifacts',
	component: WPCOMChatWithArtifacts,
	argTypes: {
		apiKey: {
			control: 'text',
			name: 'OAuth API Key',
		},
	},
	decorators: [
		( Story ) => (
			<div style={ { minHeight: '600px' } }>
				<Story />
			</div>
		),
	],
};

const Template = ( args ) => <WPCOMChatWithArtifacts { ...args } />;

export const ChatWithArtifactsDemo = Template.bind( {} );

ChatWithArtifactsDemo.args = {
	apiKey: import.meta.env.STORYBOOK_LANGCHAIN_API_KEY,
	baseUrl: import.meta.env.STORYBOOK_LANGGRAPH_CLOUD_BASE_URL,
	wpcomClientId: import.meta.env.STORYBOOK_WPCOM_CLIENT_ID,
	wpcomOauthToken: import.meta.env.STORYBOOK_WPCOM_ACCESS_TOKEN,
	redirectUri: import.meta.env.STORYBOOK_WPCOM_REDIRECT_URI,
};
