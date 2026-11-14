import { StyleSheet } from 'react-native';

export const uiStyles = StyleSheet.create({
  image: {
    backgroundColor: '#F8EEE4',
  },
  imageFallback: {
    backgroundColor: '#FFF0E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: {
    fontSize: 64,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '900',
    letterSpacing: 0.1,
  },
  field: {
    marginBottom: 13,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#221C18',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EDE7DF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 45,
    color: '#221C18',
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 78,
    textAlignVertical: 'top',
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
    gap: 10,
  },
  titleContent: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#FF6835',
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
    color: '#221C18',
  },
  subTitle: {
    color: '#746E69',
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },
  sectionAction: {
    fontWeight: '900',
    fontSize: 12,
    color: '#FF6835',
    marginBottom: 5,
  },
});
